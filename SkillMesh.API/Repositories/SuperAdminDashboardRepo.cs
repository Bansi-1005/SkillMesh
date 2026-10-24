
using System;
using System.Collections.Generic;
using System.Data;
using SkillMesh.API.Data;
using SkillMesh.API.DTOs.SuperAdminDashboard;
using SkillMesh.API.Interfaces.IRepos;

namespace SkillMesh.API.Repositories
{
    public class SuperAdminDashboardRepo : ISuperAdminDashboardRepo
    {
        private readonly DbConnectionFactory _connectionFactory;

        public SuperAdminDashboardRepo(
            DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public SuperAdminDashboardDto GetDashboardData()
        {
            var dashboard = new SuperAdminDashboardDto();

            using IDbConnection connection =
                _connectionFactory.CreateConnection();

            connection.Open();

            // Total users
            dashboard.TotalUsers = GetCount(
                connection,
                "SELECT COUNT(*) FROM Users"
            );

            // Active users
            dashboard.ActiveUsers = GetCount(
                connection,
                "SELECT COUNT(*) FROM Users WHERE IsActive = 1"
            );

            // Users registered during the current calendar month
            dashboard.NewUsersThisMonth = GetCount(
                connection,
                @"SELECT COUNT(*)
                  FROM Users
                  WHERE CreatedAt >= DATEFROMPARTS(
                      YEAR(GETDATE()), MONTH(GETDATE()), 1
                  )
                  AND CreatedAt < DATEADD(
                      MONTH,
                      1,
                      DATEFROMPARTS(
                          YEAR(GETDATE()), MONTH(GETDATE()), 1
                      )
                  )"
            );

            // Count users whose role is Admin
            dashboard.TotalAdmins = GetCount(
                connection,
                @"SELECT COUNT(*)
                  FROM Users u
                  INNER JOIN Roles r
                      ON u.RoleId = r.RoleId
                  WHERE LTRIM(RTRIM(r.RoleName)) = 'Admin'"
            );

            // Total skills
            dashboard.TotalSkills = GetCount(
                connection,
                "SELECT COUNT(*) FROM Skills"
            );

            // Total courses
            dashboard.TotalCourses = GetCount(
                connection,
                "SELECT COUNT(*) FROM Courses"
            );

            // Published courses
            dashboard.PublishedCourses = GetCount(
                connection,
                "SELECT COUNT(*) FROM Courses WHERE IsPublished = 1"
            );

            // Calculate percentages safely
            dashboard.ActiveUsersPercentage = GetPercentage(
                dashboard.ActiveUsers,
                dashboard.TotalUsers
            );

            dashboard.PublishedCoursesPercentage = GetPercentage(
                dashboard.PublishedCourses,
                dashboard.TotalCourses
            );

            // Monthly user registration chart
            dashboard.MonthlyUserRegistrations =
                GetMonthlyUserRegistrations(connection);

            return dashboard;
        }

        private static int GetCount(
            IDbConnection connection,
            string query)
        {
            using IDbCommand command = connection.CreateCommand();

            command.CommandText = query;

            object? result = command.ExecuteScalar();

            if (result == null || result == DBNull.Value)
            {
                return 0;
            }

            return Convert.ToInt32(result);
        }

        private static int GetPercentage(int part, int total)
        {
            if (total <= 0)
            {
                return 0;
            }

            return (int)Math.Round(
                (double)part / total * 100,
                MidpointRounding.AwayFromZero
            );
        }

        private static List<MonthlyUserRegistrationDto>
            GetMonthlyUserRegistrations(IDbConnection connection)
        {
            var registrations =
                new List<MonthlyUserRegistrationDto>();

            using IDbCommand command = connection.CreateCommand();

            command.CommandText = @"
                WITH Months AS
                (
                    SELECT
                        DATEADD(
                            MONTH,
                            -v.MonthOffset,
                            DATEFROMPARTS(
                                YEAR(GETDATE()),
                                MONTH(GETDATE()),
                                1
                            )
                        ) AS MonthStart
                    FROM (VALUES (5), (4), (3), (2), (1), (0))
                        AS v(MonthOffset)
                )
                SELECT
                    m.MonthStart,
                    COUNT(u.UserId) AS UserCount
                FROM Months AS m
                LEFT JOIN Users AS u
                    ON u.CreatedAt >= m.MonthStart
                    AND u.CreatedAt < DATEADD(
                        MONTH,
                        1,
                        m.MonthStart
                    )
                GROUP BY m.MonthStart
                ORDER BY m.MonthStart;";

            using IDataReader reader = command.ExecuteReader();

            while (reader.Read())
            {
                DateTime monthStart =
                    Convert.ToDateTime(reader["MonthStart"]);

                registrations.Add(
                    new MonthlyUserRegistrationDto
                    {
                        Month = monthStart.ToString("MMM"),
                        Users = Convert.ToInt32(reader["UserCount"])
                    }
                );
            }

            return registrations;
        }
    }
}

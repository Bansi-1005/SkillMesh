using Dapper;
using Microsoft.Data.SqlClient;
using SkillMesh.API.DTOs.AdminDashboard;
using SkillMesh.API.Interfaces.IRepos;

namespace SkillMesh.API.Repositories
{
    public class AdminDashboardRepo : IAdminDashboardRepo
    {
        private readonly IConfiguration _configuration;

        public AdminDashboardRepo(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private SqlConnection GetConnection()
        {
            return new SqlConnection(
                _configuration.GetConnectionString("DefaultConnection"));
        }

        public async Task<AdminDashboardDto> GetDashboardAsync(
            int adminUserId)
        {
            using var connection = GetConnection();
            await connection.OpenAsync();

            // 1. Validate the logged-in Admin.
            const string adminSql = @"
                SELECT COUNT(1)
                FROM dbo.Users U
                INNER JOIN dbo.Roles R ON R.RoleId = U.RoleId
                WHERE U.UserId = @AdminUserId
                  AND R.RoleName = 'Admin'
                  AND U.IsActive = 1;";

            var isValidAdmin = await connection.ExecuteScalarAsync<int>(
                adminSql,
                new { AdminUserId = adminUserId });

            if (isValidAdmin == 0)
            {
                throw new UnauthorizedAccessException(
                    "The Admin account was not found, is inactive, or has no Admin role.");
            }

            // 2. Get system-wide dashboard counts.
            const string summarySql = @"
                SELECT
                    (
                        SELECT COUNT(DISTINCT LP.LearnerId)
                        FROM dbo.LearnerProfiles LP
                        INNER JOIN dbo.Users U
                            ON U.UserId = LP.LearnerId
                        INNER JOIN dbo.Roles R
                            ON R.RoleId = U.RoleId
                        WHERE R.RoleName = 'Learner'
                    ) AS TotalLearners,

                    (
                        SELECT COUNT(*)
                        FROM dbo.Skills
                        WHERE IsActive = 1
                    ) AS AvailableSkills,

                    (
                        SELECT COUNT(*)
                        FROM dbo.Courses
                        WHERE IsPublished = 1
                    ) AS PublishedCourses,

                    (
                        SELECT COUNT(*)
                        FROM dbo.Assessments
                        WHERE IsActive = 1
                    ) AS ActiveAssessments;";

            var dashboard =
                await connection.QuerySingleAsync<AdminDashboardDto>(
                    summarySql);

            // 3. Get all learner profiles.
            const string learnersSql = @"
                SELECT
                    LP.LearnerId,
                    U.UserId,
                    U.FirstName,
                    U.LastName,
                    U.Email,
                    LP.DateOfBirth,
                    LP.Bio,
                    U.IsActive,
                    U.CreatedAt
                FROM dbo.LearnerProfiles LP
                INNER JOIN dbo.Users U
                    ON U.UserId = LP.LearnerId
                INNER JOIN dbo.Roles R
                    ON R.RoleId = U.RoleId
                WHERE R.RoleName = 'Learner'
                ORDER BY U.CreatedAt DESC, LP.LearnerId DESC;";

            var learners =
                await connection.QueryAsync<AdminDashboardDetailDtos>(
                    learnersSql);

            dashboard.Learners = learners.ToList();

            // Organization fields remain in the DTO for compatibility
            // with any existing frontend that still reads these fields.
            //dashboard.OrganizationId = null;
            //dashboard.OrganizationName = string.Empty;
            //dashboard.OrganizationCount = 0;
            //dashboard.Organizations = new List<AdminOrganizationDto>();

            return dashboard;
        }
    }
}
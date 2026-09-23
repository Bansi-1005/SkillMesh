using Dapper;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Models;

namespace SkillMesh.API.Repositories
{
    public class AuthRepo : IAuthRepo
    {
        private readonly DbConnectionFactory _connectionFactory;

        public AuthRepo(
            DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }


        // =====================================================
        // CHECK EMAIL
        // =====================================================

        public async Task<bool> EmailExists(string email)
        {
            using var connection =
                _connectionFactory.CreateConnection();

            string sql = @"
                SELECT COUNT(1)
                FROM Users
                WHERE Email = @Email;
            ";

            int count =
                await connection.ExecuteScalarAsync<int>(
                    sql,
                    new
                    {
                        Email = email
                    });

            return count > 0;
        }


        // =====================================================
        // CHECK ORGANIZATION
        // =====================================================

        public async Task<bool> OrganizationExists(
            int organizationId)
        {
            using var connection =
                _connectionFactory.CreateConnection();

            string sql = @"
                SELECT COUNT(1)
                FROM Organizations
                WHERE OrganizationId = @OrganizationId
                  AND IsActive = 1;
            ";

            int count =
                await connection.ExecuteScalarAsync<int>(
                    sql,
                    new
                    {
                        OrganizationId = organizationId
                    });

            return count > 0;
        }


        // =====================================================
        // GET ROLE ID
        // =====================================================

        public async Task<int?> GetRoleIdByName(
            string roleName)
        {
            using var connection =
                _connectionFactory.CreateConnection();

            string sql = @"
                SELECT RoleId
                FROM Roles
                WHERE RoleName = @RoleName
                  AND IsActive = 1;
            ";

            return await connection.QueryFirstOrDefaultAsync<int?>(
                sql,
                new
                {
                    RoleName = roleName
                });
        }


        // =====================================================
        // CREATE USER
        // =====================================================

        public async Task<int> CreateUser(
            User user,
            bool createLearnerProfile)
        {
            using var connection =
                _connectionFactory.CreateConnection();


            connection.Open();

            using var transaction =
                connection.BeginTransaction();

            try
            {
                string userSql = @"
                    INSERT INTO Users
                    (
                        OrganizationId,
                        RoleId,
                        FirstName,
                        LastName,
                        Email,
                        PasswordHash,
                        Phone,
                        IsEmailVerified,
                        IsActive
                    )
                    VALUES
                    (
                        @OrganizationId,
                        @RoleId,
                        @FirstName,
                        @LastName,
                        @Email,
                        @PasswordHash,
                        @Phone,
                        @IsEmailVerified,
                        @IsActive
                    );

                    SELECT CAST(SCOPE_IDENTITY() AS INT);
                ";

                int userId =
                    await connection.ExecuteScalarAsync<int>(
                        userSql,
                        user,
                        transaction);


                // =================================================
                // CREATE LEARNER PROFILE
                // =================================================

                if (createLearnerProfile)
                {
                    string learnerProfileSql = @"
                        INSERT INTO LearnerProfiles
                        (
                            LearnerId
                        )
                        VALUES
                        (
                            @LearnerId
                        );
                    ";

                    await connection.ExecuteAsync(
                        learnerProfileSql,
                        new
                        {
                            LearnerId = userId
                        },
                        transaction);
                }


                transaction.Commit();

                return userId;
            }
            catch
            {
                transaction.Rollback();

                throw;
            }
        }


        // =====================================================
        // GET USER BY EMAIL
        // =====================================================

        public async Task<User?> GetUserByEmail(
            string email)
        {
            using var connection =
                _connectionFactory.CreateConnection();

            string sql = @"
                SELECT
                    u.UserId,
                    u.OrganizationId,
                    u.RoleId,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.PasswordHash,
                    u.Phone,
                    u.IsEmailVerified,
                    u.IsActive,
                    u.CreatedAt,
                    u.UpdatedAt,

                    r.RoleName

                FROM Users u

                INNER JOIN Roles r
                    ON u.RoleId = r.RoleId

                WHERE u.Email = @Email
                  AND u.IsActive = 1
                  AND r.IsActive = 1;
            ";

            return await connection.QueryFirstOrDefaultAsync<User>(
                sql,
                new
                {
                    Email = email
                });
        }
    }
}
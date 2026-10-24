
using Dapper;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Models;

namespace SkillMesh.API.Repositories
{
    public class AuthRepo : IAuthRepo
    {
        private readonly DbConnectionFactory _connectionFactory;

        public AuthRepo(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        // =============================================
        // CHECK WHETHER EMAIL ALREADY EXISTS
        // =============================================

        public async Task<bool> EmailExists(string email)
        {
            using var connection = _connectionFactory.CreateConnection();

            const string sql = @"
                SELECT COUNT(1)
                FROM dbo.Users
                WHERE Email = @Email;
            ";

            int count = await connection.ExecuteScalarAsync<int>(
                sql,
                new { Email = email }
            );

            return count > 0;
        }

        // =============================================
        // GET ROLE ID
        // =============================================

        public async Task<int?> GetRoleIdByName(string roleName)
        {
            using var connection = _connectionFactory.CreateConnection();

            const string sql = @"
                SELECT RoleId
                FROM dbo.Roles
                WHERE RoleName = @RoleName
                  AND IsActive = 1;
            ";

            return await connection.QueryFirstOrDefaultAsync<int?>(
                sql,
                new { RoleName = roleName }
            );
        }

        // =============================================
        // CREATE USER
        // =============================================

        public async Task<int> CreateUser(
            User user,
            bool createLearnerProfile)
        {
            using var connection = _connectionFactory.CreateConnection();

            connection.Open();

            using var transaction = connection.BeginTransaction();

            try
            {
                const string userSql = @"
                    INSERT INTO dbo.Users
                    (
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

                int userId = await connection.ExecuteScalarAsync<int>(
                    userSql,
                    user,
                    transaction
                );

                // Create a profile only for learners.
                if (createLearnerProfile)
                {
                    const string learnerProfileSql = @"
                        INSERT INTO dbo.LearnerProfiles
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
                        new { LearnerId = userId },
                        transaction
                    );
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

        // =============================================
        // GET USER BY EMAIL FOR LOGIN
        // =============================================

        public async Task<User?> GetUserByEmail(string email)
        {
            using var connection = _connectionFactory.CreateConnection();

            const string sql = @"
                SELECT
                    u.UserId,
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
                FROM dbo.Users AS u
                INNER JOIN dbo.Roles AS r
                    ON u.RoleId = r.RoleId
                WHERE u.Email = @Email
                  AND u.IsActive = 1
                  AND r.IsActive = 1;
            ";

            return await connection.QueryFirstOrDefaultAsync<User>(
                sql,
                new { Email = email }
            );
        }
    }
}

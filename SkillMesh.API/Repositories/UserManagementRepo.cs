using Microsoft.Data.SqlClient;
using SkillMesh.API.DTOs.UserManagement;
using SkillMesh.API.Interfaces.IRepos;
using System.Data;

namespace SkillMesh.API.Repositories
{
    public class UserManagementRepo : IUserManagementRepo
    {
        private readonly string _connectionString;

        public UserManagementRepo(IConfiguration configuration)
        {
            _connectionString =
                configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "DefaultConnection is missing from appsettings.json.");
        }

        // GET: api/UserManagement/users
        public async Task<List<UserListDto>> GetUsersAsync()
        {
            var users = new List<UserListDto>();

            const string sql = @"
                SELECT
                    u.UserId,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.Phone,
                    r.RoleId,
                    r.RoleName,
                    u.IsActive,
                    u.CreatedAt,
                    u.DeactivatedBySuperAdmin
                FROM dbo.Users AS u
                INNER JOIN dbo.Roles AS r
                    ON u.RoleId = r.RoleId
                ORDER BY u.UserId DESC;";

            try
            {
                await using var connection =
                    new SqlConnection(_connectionString);

                await using var command =
                    new SqlCommand(sql, connection);

                await connection.OpenAsync();

                await using var reader =
                    await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    users.Add(new UserListDto
                    {
                        UserId = Convert.ToInt32(reader["UserId"]),
                        FirstName = reader["FirstName"]?.ToString()
                            ?? string.Empty,
                        LastName = reader["LastName"]?.ToString()
                            ?? string.Empty,
                        Email = reader["Email"]?.ToString()
                            ?? string.Empty,
                        Phone = reader["Phone"] == DBNull.Value
                            ? null
                            : reader["Phone"].ToString(),
                        RoleId = Convert.ToInt32(reader["RoleId"]),
                        RoleName = reader["RoleName"]?.ToString()
                            ?? string.Empty,
                        IsActive = Convert.ToBoolean(reader["IsActive"]),
                        CreatedAt = reader["CreatedAt"] == DBNull.Value
                            ? DateTime.MinValue
                            : Convert.ToDateTime(reader["CreatedAt"]),
                        DeactivatedBySuperAdmin =
                            reader["DeactivatedBySuperAdmin"] != DBNull.Value
                            && Convert.ToBoolean(
                                reader["DeactivatedBySuperAdmin"])
                    });
                }

                return users;
            }
            catch (SqlException ex)
            {
                throw new InvalidOperationException(
                    "Database error while loading users.", ex);
            }
        }

        // General user status endpoint: Super Admin only.
        // RoleId 1 = Super Admin, 2 = Admin, 3 = Learner.
        public async Task<bool> SetUserStatusAsync(
            int userId,
            bool isActive)
        {
            const string sql = @"
                UPDATE dbo.Users
                SET
                    IsActive = @IsActive,
                    DeactivatedBySuperAdmin =
                        CASE
                            WHEN RoleId = 3 AND @IsActive = 0 THEN 1
                            ELSE 0
                        END
                WHERE UserId = @UserId
                  AND RoleId IN (2, 3);";

            try
            {
                await using var connection =
                    new SqlConnection(_connectionString);

                await using var command =
                    new SqlCommand(sql, connection);

                command.Parameters.Add("@UserId", SqlDbType.Int).Value =
                    userId;

                command.Parameters.Add("@IsActive", SqlDbType.Bit).Value =
                    isActive;

                await connection.OpenAsync();

                return await command.ExecuteNonQueryAsync() > 0;
            }
            catch (SqlException ex)
            {
                throw new InvalidOperationException(
                    "Database error while updating the user status.", ex);
            }
        }

        // Learner-only status endpoint.
        // Super Admin can activate/deactivate.
        // Admin can deactivate an active learner, but cannot reactivate.

        public async Task<bool> SetLearnerStatusAsync(
            int userId,
            bool isActive,
            bool isSuperAdmin)
        {
            const string sql = @"
        UPDATE dbo.Users
        SET
            IsActive = @IsActive,
            DeactivatedBySuperAdmin =
                CASE
                    WHEN @IsActive = 0 AND @IsSuperAdmin = 1 THEN 1
                    ELSE 0
                END
        WHERE UserId = @UserId
          AND RoleId = 3
          AND
          (
              -- Super Admin can activate or deactivate any learner.
              @IsSuperAdmin = 1

              OR

              -- Admin can deactivate an active learner.
              (
                  @IsSuperAdmin = 0
                  AND @IsActive = 0
                  AND IsActive = 1
              )

              OR

              -- Admin can reactivate an inactive learner only
              -- if Super Admin did not deactivate that learner.
              (
                  @IsSuperAdmin = 0
                  AND @IsActive = 1
                  AND IsActive = 0
                  AND DeactivatedBySuperAdmin = 0
              )
          );";

            try
            {
                await using var connection =
                    new SqlConnection(_connectionString);

                await using var command =
                    new SqlCommand(sql, connection);

                command.Parameters.Add("@UserId", SqlDbType.Int).Value =
                    userId;

                command.Parameters.Add("@IsActive", SqlDbType.Bit).Value =
                    isActive;

                command.Parameters.Add("@IsSuperAdmin", SqlDbType.Bit).Value =
                    isSuperAdmin;

                await connection.OpenAsync();

                int affectedRows = await command.ExecuteNonQueryAsync();

                return affectedRows > 0;
            }
            catch (SqlException ex)
            {
                throw new InvalidOperationException(
                    "Database error while updating learner status.", ex);
            }
        }

    }
}
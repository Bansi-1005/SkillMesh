using Microsoft.Data.SqlClient;
using SkillMesh.API.DTOs.Organizations;
using SkillMesh.API.DTOs.UserManagement;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using System.Data;

namespace SkillMesh.API.Repositories
{
    public class UserManagementRepo
        : IUserManagementRepo
    {
        private readonly string _connectionString;

        public UserManagementRepo(
            IConfiguration configuration)
        {
            _connectionString =
                configuration.GetConnectionString(
                    "DefaultConnection")
                ?? throw new InvalidOperationException(
                    "DefaultConnection is missing from appsettings.json.");
        }

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
                    u.OrganizationId,
                    o.OrganizationName,
                    r.RoleId,
                    r.RoleName,
                    u.IsActive,
                    u.CreatedAt
                FROM dbo.Users AS u
                INNER JOIN dbo.Roles AS r
                    ON u.RoleId = r.RoleId
                LEFT JOIN dbo.Organizations AS o
                    ON u.OrganizationId = o.OrganizationId
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
                        UserId = reader.GetInt32(
                            reader.GetOrdinal("UserId")),

                        FirstName = reader["FirstName"] as string
                            ?? string.Empty,

                        LastName = reader["LastName"] as string
                            ?? string.Empty,

                        Email = reader["Email"] as string
                            ?? string.Empty,

                        Phone = reader["Phone"] == DBNull.Value
                            ? null
                            : reader["Phone"].ToString(),

                        OrganizationId =
                            reader["OrganizationId"] == DBNull.Value
                                ? null
                                : Convert.ToInt32(
                                    reader["OrganizationId"]),

                        OrganizationName =
                            reader["OrganizationName"] == DBNull.Value
                                ? null
                                : reader["OrganizationName"].ToString(),

                        RoleId = Convert.ToInt32(reader["RoleId"]),

                        RoleName = reader["RoleName"] as string
                            ?? string.Empty,

                        IsActive = Convert.ToBoolean(
                            reader["IsActive"]),

                        CreatedAt = reader["CreatedAt"] == DBNull.Value
                                    ? DateTime.MinValue
                                    : Convert.ToDateTime(reader["CreatedAt"])
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

        public async Task<List<OrganizationListDto>>
            GetOrganizationsAsync()
        {
            var organizations =
                new List<OrganizationListDto>();

            const string sql = @"
                SELECT OrganizationId, OrganizationName
                FROM dbo.Organizations
                WHERE IsActive = 1
                ORDER BY OrganizationName;";

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
                    organizations.Add(new OrganizationListDto
                    {
                        OrganizationId = Convert.ToInt32(
                            reader["OrganizationId"]),

                        OrganizationName =
                            reader["OrganizationName"] as string
                            ?? string.Empty
                    });
                }

                return organizations;
            }
            catch (SqlException ex)
            {
                throw new InvalidOperationException(
                    "Database error while loading organizations.", ex);
            }
        }

        public async Task<bool> SetUserStatusAsync(
            int userId,
            bool isActive)
        {
            // RoleId 1 is reserved for Super Admin in this project.
            // This endpoint changes the status of Admin and Learner
            // accounts only.
            const string sql = @"
                UPDATE dbo.Users
                SET IsActive = @IsActive
                WHERE UserId = @UserId
                  AND RoleId IN (2, 3);";

            try
            {
                await using var connection =
                    new SqlConnection(_connectionString);

                await using var command =
                    new SqlCommand(sql, connection);

                command.Parameters.Add(
                    "@UserId", SqlDbType.Int).Value = userId;

                command.Parameters.Add(
                    "@IsActive", SqlDbType.Bit).Value = isActive;

                await connection.OpenAsync();

                int rowsAffected =
                    await command.ExecuteNonQueryAsync();

                return rowsAffected > 0;
            }
            catch (SqlException ex)
            {
                throw new InvalidOperationException(
                    "Database error while updating the user status.", ex);
            }
        }
    }
}

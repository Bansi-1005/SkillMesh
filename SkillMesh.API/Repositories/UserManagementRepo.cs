
using Microsoft.Data.SqlClient;
using SkillMesh.API.DTOs.Organizations;
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
                        UserId = Convert.ToInt32(reader["UserId"]),

                        FirstName =
                            reader["FirstName"]?.ToString() ?? string.Empty,

                        LastName =
                            reader["LastName"]?.ToString() ?? string.Empty,

                        Email =
                            reader["Email"]?.ToString() ?? string.Empty,

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

                        RoleName =
                            reader["RoleName"]?.ToString() ?? string.Empty,

                        IsActive = Convert.ToBoolean(reader["IsActive"]),

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

        // GET: api/UserManagement/organizations
        public async Task<List<OrganizationListDto>>
            GetOrganizationsAsync()
        {
            var organizations = new List<OrganizationListDto>();

            const string sql = @"
                SELECT
                    OrganizationId,
                    OrganizationName
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
                        OrganizationId =
                            Convert.ToInt32(reader["OrganizationId"]),

                        OrganizationName =
                            reader["OrganizationName"]?.ToString()
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

        // PUT: api/UserManagement/users/{userId}/status
        // Super Admin can activate/deactivate Admin and Learner accounts.
        // RoleId 1 is assumed to be Super Admin.
        public async Task<bool> SetUserStatusAsync(
            int userId,
            bool isActive)
        {
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

                return await command.ExecuteNonQueryAsync() > 0;
            }
            catch (SqlException ex)
            {
                throw new InvalidOperationException(
                    "Database error while updating the user status.", ex);
            }
        }

        // GET: api/UserManagement/organization-learners
        // Lists learners belonging to the specified organization.
        // Uses existing tables only; does not reference
        // the missing dbo.OrganizationLearners table.
        public async Task<IEnumerable<LearnerManagementDto>>
            GetOrganizationLearnersAsync(int organizationId)
        {
            var learners = new List<LearnerManagementDto>();

            const string sql = @"           
                                SELECT
                                    u.UserId,
                                    u.FirstName,
                                    u.LastName,
                                    u.Email,
                                    u.OrganizationId,
                                    o.OrganizationName,
                                    u.IsActive,
                                    o.IsActive AS OrganizationIsActive,
                                    u.CreatedAt
                                FROM dbo.Users AS u
                                INNER JOIN dbo.Roles AS r
                                    ON u.RoleId = r.RoleId
                                INNER JOIN dbo.Organizations AS o
                                    ON u.OrganizationId = o.OrganizationId
                                WHERE u.OrganizationId = @OrganizationId
                                    AND r.RoleName = 'Learner'
                                ORDER BY u.UserId DESC;
                                ;";

            try
            {
                await using var connection =
                    new SqlConnection(_connectionString);

                await using var command =
                    new SqlCommand(sql, connection);

                command.Parameters.Add(
                    "@OrganizationId", SqlDbType.Int).Value =
                    organizationId;

                await connection.OpenAsync();

                await using var reader =
                    await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    bool accountIsActive =
                        Convert.ToBoolean(reader["IsActive"]);

                    learners.Add(new LearnerManagementDto
                    {
                        UserId =
                            Convert.ToInt32(reader["UserId"]),

                        FirstName =
                            reader["FirstName"]?.ToString() ?? string.Empty,

                        LastName =
                            reader["LastName"]?.ToString() ?? string.Empty,

                        Email =
                            reader["Email"]?.ToString() ?? string.Empty,

                        OrganizationId =
                            reader["OrganizationId"] == DBNull.Value
                                ? null
                                : Convert.ToInt32(
                                    reader["OrganizationId"]),

                        OrganizationName =
                            reader["OrganizationName"] == DBNull.Value
                                ? null
                                : reader["OrganizationName"].ToString(),

                        // This workaround uses the global account status.
                        IsActive = accountIsActive,
                        AdminIsActive = accountIsActive,

                        OrganizationIsActive =
                            Convert.ToBoolean(
                                reader["OrganizationIsActive"]),
                        CreatedAt =
                            Convert.ToDateTime(reader["CreatedAt"])
                    });
                }

                return learners;
            }
            catch (SqlException ex)
            {
                throw new InvalidOperationException(
                    "Database error while loading organization learners.",
                    ex);
            }
        }

        // PUT: api/UserManagement/organization-learners/{userId}/status
        //
        // IMPORTANT:
        // This updates dbo.Users.IsActive because the separate
        // dbo.OrganizationLearners table does not exist.
        // It therefore changes the global account status.
        public async Task<bool> SetOrganizationLearnerStatusAsync(
            int userId,
            int organizationId,
            bool adminIsActive)
        {
            const string sql = @"
                UPDATE u
                SET u.IsActive = @IsActive
                FROM dbo.Users AS u
                INNER JOIN dbo.Roles AS r
                    ON r.RoleId = u.RoleId
                INNER JOIN dbo.Organizations AS o
                    ON o.OrganizationId = u.OrganizationId
                WHERE u.UserId = @UserId
                  AND u.OrganizationId = @OrganizationId
                  AND r.RoleName = 'Learner'
                  AND o.IsActive = 1;";

            try
            {
                await using var connection =
                    new SqlConnection(_connectionString);

                await using var command =
                    new SqlCommand(sql, connection);

                command.Parameters.Add(
                    "@UserId", SqlDbType.Int).Value = userId;

                command.Parameters.Add(
                    "@OrganizationId", SqlDbType.Int).Value =
                    organizationId;

                command.Parameters.Add(
                    "@IsActive", SqlDbType.Bit).Value = adminIsActive;

                await connection.OpenAsync();

                return await command.ExecuteNonQueryAsync() > 0;
            }
            catch (SqlException ex)
            {
                throw new InvalidOperationException(
                    "Database error while updating the learner status.",
                    ex);
            }
        }
    }
}

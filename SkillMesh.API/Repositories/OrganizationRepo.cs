using Dapper;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Models;

namespace SkillMesh.API.Repositories
{
    public class OrganizationRepo : IOrganizationRepo
    {
        private readonly DbConnectionFactory _connectionFactory;

        public OrganizationRepo(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        // GET ALL
        public async Task<IEnumerable<Organization>> GetAll()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        OrganizationId,
                        OrganizationName,
                        OrganizationCode,
                        Email,
                        Phone,
                        Address,
                        City,
                        State,
                        Country,
                        IsActive,
                        CreatedAt
                    FROM Organizations
                    ORDER BY OrganizationId DESC";

                return await connection.QueryAsync<Organization>(sql);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BY ID
        public async Task<Organization?> GetById(int id)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        OrganizationId,
                        OrganizationName,
                        OrganizationCode,
                        Email,
                        Phone,
                        Address,
                        City,
                        State,
                        Country,
                        IsActive,
                        CreatedAt
                    FROM Organizations
                    WHERE OrganizationId = @Id";

                return await connection.QueryFirstOrDefaultAsync<Organization>(
                    sql,
                    new { Id = id });
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE
        public async Task<int> Create(Organization organization)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    INSERT INTO Organizations
                    (
                        OrganizationName,
                        OrganizationCode,
                        Email,
                        Phone,
                        Address,
                        City,
                        State,
                        Country
                    )
                    VALUES
                    (
                        @OrganizationName,
                        @OrganizationCode,
                        @Email,
                        @Phone,
                        @Address,
                        @City,
                        @State,
                        @Country
                    );

                    SELECT CAST(SCOPE_IDENTITY() AS INT);";

                return await connection.ExecuteScalarAsync<int>(
                    sql,
                    organization);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(
            int id,
            Organization organization)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    UPDATE Organizations
                    SET
                        OrganizationName = @OrganizationName,
                        OrganizationCode = @OrganizationCode,
                        Email = @Email,
                        Phone = @Phone,
                        Address = @Address,
                        City = @City,
                        State = @State,
                        Country = @Country,
                        IsActive = @IsActive
                    WHERE OrganizationId = @Id";

                int rows = await connection.ExecuteAsync(
                    sql,
                    new
                    {
                        Id = id,
                        organization.OrganizationName,
                        organization.OrganizationCode,
                        organization.Email,
                        organization.Phone,
                        organization.Address,
                        organization.City,
                        organization.State,
                        organization.Country,
                        organization.IsActive
                    });

                return rows > 0;
            }
            catch (Exception)
            {
                throw;
            }
        }

        // DELETE
        public async Task<bool> Delete(int id)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    DELETE FROM Organizations
                    WHERE OrganizationId = @Id";

                int rows = await connection.ExecuteAsync(
                    sql,
                    new { Id = id });

                return rows > 0;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

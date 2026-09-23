using Dapper;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Models;

namespace SkillMesh.API.Repositories
{
    public class JobRoleRepo : IJobRoleRepo
    {
        private readonly DbConnectionFactory _dbConnectionFactory;

        public JobRoleRepo(DbConnectionFactory dbConnectionFactory)
        {
            _dbConnectionFactory = dbConnectionFactory;
        }

        // GET ALL
        public async Task<IEnumerable<JobRole>> GetAll()
        {
            try
            {
                using var connection = _dbConnectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        JobRoleId,
                        JobRoleName,
                        Description,
                        IsActive,
                        CreatedAt
                    FROM JobRoles
                    ORDER BY JobRoleId DESC";

                return await connection.QueryAsync<JobRole>(sql);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BY ID
        public async Task<JobRole?> GetById(int id)
        {
            try
            {
                using var connection = _dbConnectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        JobRoleId,
                        JobRoleName,
                        Description,
                        IsActive,
                        CreatedAt
                    FROM JobRoles
                    WHERE JobRoleId = @Id";

                return await connection.QueryFirstOrDefaultAsync<JobRole>(
                    sql,
                    new { Id = id }
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE
        public async Task<int> Create(JobRole jobRole)
        {
            try
            {
                using var connection = _dbConnectionFactory.CreateConnection();

                string sql = @"
                    INSERT INTO JobRoles
                    (
                        JobRoleName,
                        Description
                    )
                    VALUES
                    (
                        @JobRoleName,
                        @Description
                    );

                    SELECT CAST(SCOPE_IDENTITY() AS INT);";

                return await connection.ExecuteScalarAsync<int>(
                    sql,
                    jobRole
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(int id, JobRole jobRole)
        {
            try
            {
                using var connection = _dbConnectionFactory.CreateConnection();

                string sql = @"
                    UPDATE JobRoles
                    SET
                        JobRoleName = @JobRoleName,
                        Description = @Description,
                        IsActive = @IsActive
                    WHERE JobRoleId = @Id";

                int rowsAffected = await connection.ExecuteAsync(
                    sql,
                    new
                    {
                        Id = id,
                        jobRole.JobRoleName,
                        jobRole.Description,
                        jobRole.IsActive
                    }
                );

                return rowsAffected > 0;
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
                using var connection = _dbConnectionFactory.CreateConnection();

                string sql = @"
                    DELETE FROM JobRoles
                    WHERE JobRoleId = @Id";

                int rowsAffected = await connection.ExecuteAsync(
                    sql,
                    new { Id = id }
                );

                return rowsAffected > 0;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

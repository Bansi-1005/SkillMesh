using Dapper;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Models;

namespace SkillMesh.API.Repositories
{
    public class LearningPathRepo : ILearningPathRepo
    {
        private readonly DbConnectionFactory _connectionFactory;

        public LearningPathRepo(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<LearningPath>> GetAll()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string query = @"
                    SELECT
                        LearningPathId,
                        JobRoleId,
                        PathName,
                        Description,
                        IsActive,
                        CreatedAt
                    FROM LearningPaths
                    ORDER BY LearningPathId DESC";

                return await connection.QueryAsync<LearningPath>(query);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<LearningPath?> GetById(int id)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string query = @"
                    SELECT
                        LearningPathId,
                        JobRoleId,
                        PathName,
                        Description,
                        IsActive,
                        CreatedAt
                    FROM LearningPaths
                    WHERE LearningPathId = @Id";

                return await connection.QueryFirstOrDefaultAsync<LearningPath>(
                    query,
                    new { Id = id }
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<int> Create(LearningPath learningPath)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string query = @"
                    INSERT INTO LearningPaths
                    (
                        JobRoleId,
                        PathName,
                        Description
                    )
                    VALUES
                    (
                        @JobRoleId,
                        @PathName,
                        @Description
                    );

                    SELECT CAST(SCOPE_IDENTITY() AS INT);";

                return await connection.ExecuteScalarAsync<int>(
                    query,
                    learningPath
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(
            int id,
            LearningPath learningPath)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string query = @"
                    UPDATE LearningPaths
                    SET
                        JobRoleId = @JobRoleId,
                        PathName = @PathName,
                        Description = @Description,
                        IsActive = @IsActive
                    WHERE LearningPathId = @Id";

                int rowsAffected = await connection.ExecuteAsync(
                    query,
                    new
                    {
                        Id = id,
                        learningPath.JobRoleId,
                        learningPath.PathName,
                        learningPath.Description,
                        learningPath.IsActive
                    }
                );

                return rowsAffected > 0;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Delete(int id)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string query = @"
                    DELETE FROM LearningPaths
                    WHERE LearningPathId = @Id";

                int rowsAffected = await connection.ExecuteAsync(
                    query,
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

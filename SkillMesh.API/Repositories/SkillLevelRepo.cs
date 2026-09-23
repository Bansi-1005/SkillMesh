using Dapper;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Models;

namespace SkillMesh.API.Repositories
{
    public class SkillLevelRepo : ISkillLevelRepo
    {
        private readonly DbConnectionFactory _connectionFactory;

        public SkillLevelRepo(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        // GET ALL
        public async Task<IEnumerable<SkillLevel>> GetAll()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        SkillLevelId,
                        LevelNumber,
                        LevelName,
                        Description
                    FROM SkillLevels
                    ORDER BY LevelNumber";

                return await connection.QueryAsync<SkillLevel>(sql);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BY ID
        public async Task<SkillLevel?> GetById(int id)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        SkillLevelId,
                        LevelNumber,
                        LevelName,
                        Description
                    FROM SkillLevels
                    WHERE SkillLevelId = @Id";

                return await connection.QueryFirstOrDefaultAsync<SkillLevel>(
                    sql,
                    new { Id = id });
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE
        public async Task<int> Create(SkillLevel skillLevel)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    INSERT INTO SkillLevels
                    (
                        LevelNumber,
                        LevelName,
                        Description
                    )
                    VALUES
                    (
                        @LevelNumber,
                        @LevelName,
                        @Description
                    );

                    SELECT CAST(SCOPE_IDENTITY() AS INT);";

                return await connection.ExecuteScalarAsync<int>(
                    sql,
                    skillLevel);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(
            int id,
            SkillLevel skillLevel)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    UPDATE SkillLevels
                    SET
                        LevelNumber = @LevelNumber,
                        LevelName = @LevelName,
                        Description = @Description
                    WHERE SkillLevelId = @Id";

                int rows = await connection.ExecuteAsync(
                    sql,
                    new
                    {
                        Id = id,
                        skillLevel.LevelNumber,
                        skillLevel.LevelName,
                        skillLevel.Description
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
                    DELETE FROM SkillLevels
                    WHERE SkillLevelId = @Id";

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

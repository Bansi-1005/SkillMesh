using Dapper;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Models;

namespace SkillMesh.API.Repositories
{
    public class SkillRepo : ISkillRepo
    {
        private readonly DbConnectionFactory _connectionFactory;

        public SkillRepo(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        // GET ALL
        public async Task<IEnumerable<Skill>> GetAll()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        SkillId,
                        SkillCategoryId,
                        SkillName,
                        Description,
                        IsActive,
                        CreatedAt
                    FROM Skills
                    ORDER BY SkillId DESC";

                return await connection.QueryAsync<Skill>(sql);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BY ID
        public async Task<Skill?> GetById(int id)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        SkillId,
                        SkillCategoryId,
                        SkillName,
                        Description,
                        IsActive,
                        CreatedAt
                    FROM Skills
                    WHERE SkillId = @Id";

                return await connection.QueryFirstOrDefaultAsync<Skill>(
                    sql,
                    new { Id = id });
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE
        public async Task<int> Create(Skill skill)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    INSERT INTO Skills
                    (
                        SkillCategoryId,
                        SkillName,
                        Description
                    )
                    VALUES
                    (
                        @SkillCategoryId,
                        @SkillName,
                        @Description
                    );

                    SELECT CAST(SCOPE_IDENTITY() AS INT);";

                return await connection.ExecuteScalarAsync<int>(
                    sql,
                    skill);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(
            int id,
            Skill skill)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    UPDATE Skills
                    SET
                        SkillCategoryId = @SkillCategoryId,
                        SkillName = @SkillName,
                        Description = @Description,
                        IsActive = @IsActive
                    WHERE SkillId = @Id";

                int rows = await connection.ExecuteAsync(
                    sql,
                    new
                    {
                        Id = id,
                        skill.SkillCategoryId,
                        skill.SkillName,
                        skill.Description,
                        skill.IsActive
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
                    DELETE FROM Skills
                    WHERE SkillId = @Id";

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

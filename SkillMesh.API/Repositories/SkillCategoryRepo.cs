using Dapper;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Models;

namespace SkillMesh.API.Repositories
{
    public class SkillCategoryRepo : ISkillCategoryRepo
    {
        private readonly DbConnectionFactory _connectionFactory;

        public SkillCategoryRepo(
            DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        // GET ALL
        public async Task<IEnumerable<SkillCategory>> GetAll()
        {
            try
            {
                using var connection =
                    _connectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        SkillCategoryId,
                        CategoryName,
                        Description,
                        IsActive,
                        CreatedAt
                    FROM SkillCategories
                    ORDER BY SkillCategoryId DESC";

                return await connection
                    .QueryAsync<SkillCategory>(sql);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BY ID
        public async Task<SkillCategory?> GetById(int id)
        {
            try
            {
                using var connection =
                    _connectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        SkillCategoryId,
                        CategoryName,
                        Description,
                        IsActive,
                        CreatedAt
                    FROM SkillCategories
                    WHERE SkillCategoryId = @Id";

                return await connection
                    .QueryFirstOrDefaultAsync<SkillCategory>(
                        sql,
                        new { Id = id });
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE
        public async Task<int> Create(
            SkillCategory skillCategory)
        {
            try
            {
                using var connection =
                    _connectionFactory.CreateConnection();

                string sql = @"
                    INSERT INTO SkillCategories
                    (
                        CategoryName,
                        Description
                    )
                    VALUES
                    (
                        @CategoryName,
                        @Description
                    );

                    SELECT CAST(SCOPE_IDENTITY() AS INT);";

                return await connection
                    .ExecuteScalarAsync<int>(
                        sql,
                        skillCategory);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(
            int id,
            SkillCategory skillCategory)
        {
            try
            {
                using var connection =
                    _connectionFactory.CreateConnection();

                string sql = @"
                    UPDATE SkillCategories
                    SET
                        CategoryName = @CategoryName,
                        Description = @Description,
                        IsActive = @IsActive
                    WHERE SkillCategoryId = @Id";

                int rows = await connection.ExecuteAsync(
                    sql,
                    new
                    {
                        Id = id,
                        skillCategory.CategoryName,
                        skillCategory.Description,
                        skillCategory.IsActive
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
                using var connection =
                    _connectionFactory.CreateConnection();

                string sql = @"
                    DELETE FROM SkillCategories
                    WHERE SkillCategoryId = @Id";

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

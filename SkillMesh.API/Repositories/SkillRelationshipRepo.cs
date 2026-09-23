using Dapper;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Models;

namespace SkillMesh.API.Repositories
{
    public class SkillRelationshipRepo : ISkillRelationshipRepo
    {
        private readonly DbConnectionFactory _dbConnectionFactory;

        public SkillRelationshipRepo(DbConnectionFactory dbConnectionFactory)
        {
            _dbConnectionFactory = dbConnectionFactory;
        }

        public async Task<IEnumerable<SkillRelationship>> GetAll()
        {
            try
            {
                using var connection = _dbConnectionFactory.CreateConnection();

                string query = @"
                    SELECT
                        SkillRelationshipId,
                        SkillId,
                        RelatedSkillId,
                        RelationshipType,
                        CreatedAt
                    FROM SkillRelationships
                    ORDER BY SkillRelationshipId DESC";

                return await connection.QueryAsync<SkillRelationship>(query);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<SkillRelationship?> GetById(int id)
        {
            try
            {
                using var connection = _dbConnectionFactory.CreateConnection();

                string query = @"
                    SELECT
                        SkillRelationshipId,
                        SkillId,
                        RelatedSkillId,
                        RelationshipType,
                        CreatedAt
                    FROM SkillRelationships
                    WHERE SkillRelationshipId = @Id";

                return await connection.QueryFirstOrDefaultAsync<SkillRelationship>(
                    query,
                    new { Id = id }
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<int> Create(SkillRelationship skillRelationship)
        {
            try
            {
                using var connection = _dbConnectionFactory.CreateConnection();

                string query = @"
                    INSERT INTO SkillRelationships
                    (
                        SkillId,
                        RelatedSkillId,
                        RelationshipType
                    )
                    VALUES
                    (
                        @SkillId,
                        @RelatedSkillId,
                        @RelationshipType
                    );

                    SELECT CAST(SCOPE_IDENTITY() AS INT);";

                return await connection.ExecuteScalarAsync<int>(
                    query,
                    skillRelationship
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(
            int id,
            SkillRelationship skillRelationship)
        {
            try
            {
                using var connection = _dbConnectionFactory.CreateConnection();

                string query = @"
                    UPDATE SkillRelationships
                    SET
                        SkillId = @SkillId,
                        RelatedSkillId = @RelatedSkillId,
                        RelationshipType = @RelationshipType
                    WHERE SkillRelationshipId = @Id";

                int rowsAffected = await connection.ExecuteAsync(
                    query,
                    new
                    {
                        Id = id,
                        skillRelationship.SkillId,
                        skillRelationship.RelatedSkillId,
                        skillRelationship.RelationshipType
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
                using var connection = _dbConnectionFactory.CreateConnection();

                string query = @"
                    DELETE FROM SkillRelationships
                    WHERE SkillRelationshipId = @Id";

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

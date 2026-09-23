using Dapper;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Models;

namespace SkillMesh.API.Repositories
{
    public class LearnerSkillRepo : ILearnerSkillRepo
    {
        private readonly DbConnectionFactory _connectionFactory;

        public LearnerSkillRepo(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        // GET ALL
        public async Task<IEnumerable<LearnerSkill>> GetAll()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        LearnerId,
                        SkillId,
                        CurrentSkillLevelId,
                        LastAssessedAt
                    FROM LearnerSkills
                    ORDER BY LearnerId, SkillId";

                return await connection.QueryAsync<LearnerSkill>(sql);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BY ID
        public async Task<LearnerSkill?> GetById(int learnerId, int skillId)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        LearnerId,
                        SkillId,
                        CurrentSkillLevelId,
                        LastAssessedAt
                    FROM LearnerSkills
                    WHERE LearnerId = @LearnerId
                    AND SkillId = @SkillId";

                return await connection.QueryFirstOrDefaultAsync<LearnerSkill>(
                    sql,
                    new
                    {
                        LearnerId = learnerId,
                        SkillId = skillId
                    });
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE
        public async Task<bool> Create(LearnerSkill learnerSkill)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    INSERT INTO LearnerSkills
                    (
                        LearnerId,
                        SkillId,
                        CurrentSkillLevelId,
                        LastAssessedAt
                    )
                    VALUES
                    (
                        @LearnerId,
                        @SkillId,
                        @CurrentSkillLevelId,
                        @LastAssessedAt
                    )";

                int rows = await connection.ExecuteAsync(sql, learnerSkill);

                return rows > 0;
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(
            int learnerId,
            int skillId,
            LearnerSkill learnerSkill)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    UPDATE LearnerSkills
                    SET
                        CurrentSkillLevelId = @CurrentSkillLevelId,
                        LastAssessedAt = @LastAssessedAt
                    WHERE LearnerId = @LearnerId
                    AND SkillId = @SkillId";

                int rows = await connection.ExecuteAsync(
                    sql,
                    new
                    {
                        LearnerId = learnerId,
                        SkillId = skillId,
                        learnerSkill.CurrentSkillLevelId,
                        learnerSkill.LastAssessedAt
                    });

                return rows > 0;
            }
            catch (Exception)
            {
                throw;
            }
        }

        // DELETE
        public async Task<bool> Delete(int learnerId, int skillId)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    DELETE FROM LearnerSkills
                    WHERE LearnerId = @LearnerId
                    AND SkillId = @SkillId";

                int rows = await connection.ExecuteAsync(
                    sql,
                    new
                    {
                        LearnerId = learnerId,
                        SkillId = skillId
                    });

                return rows > 0;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

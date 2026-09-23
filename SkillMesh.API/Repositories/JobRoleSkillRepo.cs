using Dapper;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Models;

namespace SkillMesh.API.Repositories
{
    public class JobRoleSkillRepo : IJobRoleSkillRepo
    {
        private readonly DbConnectionFactory _dbConnectionFactory;

        public JobRoleSkillRepo(
            DbConnectionFactory dbConnectionFactory)
        {
            _dbConnectionFactory = dbConnectionFactory;
        }

        // GET ALL
        public async Task<IEnumerable<JobRoleSkill>> GetAll()
        {
            try
            {
                using var connection =
                    _dbConnectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        JobRoleId,
                        SkillId,
                        RequiredSkillLevelId,
                        IsMandatory
                    FROM JobRoleSkills
                    ORDER BY JobRoleId, SkillId";

                return await connection.QueryAsync<JobRoleSkill>(sql);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BY JOB ROLE ID AND SKILL ID
        public async Task<JobRoleSkill?> GetById(
            int jobRoleId,
            int skillId)
        {
            try
            {
                using var connection =
                    _dbConnectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        JobRoleId,
                        SkillId,
                        RequiredSkillLevelId,
                        IsMandatory
                    FROM JobRoleSkills
                    WHERE JobRoleId = @JobRoleId
                    AND SkillId = @SkillId";

                return await connection
                    .QueryFirstOrDefaultAsync<JobRoleSkill>(
                        sql,
                        new
                        {
                            JobRoleId = jobRoleId,
                            SkillId = skillId
                        });
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE
        public async Task<bool> Create(
            JobRoleSkill jobRoleSkill)
        {
            try
            {
                using var connection =
                    _dbConnectionFactory.CreateConnection();

                string sql = @"
                    INSERT INTO JobRoleSkills
                    (
                        JobRoleId,
                        SkillId,
                        RequiredSkillLevelId,
                        IsMandatory
                    )
                    VALUES
                    (
                        @JobRoleId,
                        @SkillId,
                        @RequiredSkillLevelId,
                        @IsMandatory
                    )";

                int rowsAffected =
                    await connection.ExecuteAsync(
                        sql,
                        jobRoleSkill);

                return rowsAffected > 0;
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(
            int jobRoleId,
            int skillId,
            JobRoleSkill jobRoleSkill)
        {
            try
            {
                using var connection =
                    _dbConnectionFactory.CreateConnection();

                string sql = @"
                    UPDATE JobRoleSkills
                    SET
                        RequiredSkillLevelId =
                            @RequiredSkillLevelId,
                        IsMandatory =
                            @IsMandatory
                    WHERE JobRoleId = @JobRoleId
                    AND SkillId = @SkillId";

                int rowsAffected =
                    await connection.ExecuteAsync(
                        sql,
                        new
                        {
                            JobRoleId = jobRoleId,
                            SkillId = skillId,
                            jobRoleSkill.RequiredSkillLevelId,
                            jobRoleSkill.IsMandatory
                        });

                return rowsAffected > 0;
            }
            catch (Exception)
            {
                throw;
            }
        }

        // DELETE
        public async Task<bool> Delete(
            int jobRoleId,
            int skillId)
        {
            try
            {
                using var connection =
                    _dbConnectionFactory.CreateConnection();

                string sql = @"
                    DELETE FROM JobRoleSkills
                    WHERE JobRoleId = @JobRoleId
                    AND SkillId = @SkillId";

                int rowsAffected =
                    await connection.ExecuteAsync(
                        sql,
                        new
                        {
                            JobRoleId = jobRoleId,
                            SkillId = skillId
                        });

                return rowsAffected > 0;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

using Dapper;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Models;

namespace SkillMesh.API.Repositories
{
    public class LearnerProfileRepo : ILearnerProfileRepo
    {
        private readonly DbConnectionFactory _dbConnectionFactory;

        public LearnerProfileRepo(
            DbConnectionFactory dbConnectionFactory)
        {
            _dbConnectionFactory = dbConnectionFactory;
        }

        // GET ALL
        public async Task<IEnumerable<LearnerProfile>> GetAll()
        {
            try
            {
                using var connection =
                    _dbConnectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        LearnerId,
                        DateOfBirth,
                        Bio,
                        ProfilePhotoUrl,
                        CreatedAt
                    FROM LearnerProfiles
                    ORDER BY LearnerId";

                return await connection
                    .QueryAsync<LearnerProfile>(sql);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BY ID
        public async Task<LearnerProfile?> GetById(
            int learnerId)
        {
            try
            {
                using var connection =
                    _dbConnectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        LearnerId,
                        DateOfBirth,
                        Bio,
                        ProfilePhotoUrl,
                        CreatedAt
                    FROM LearnerProfiles
                    WHERE LearnerId = @LearnerId";

                return await connection
                    .QueryFirstOrDefaultAsync<LearnerProfile>(
                        sql,
                        new
                        {
                            LearnerId = learnerId
                        });
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE
        public async Task<bool> Create(
            LearnerProfile learnerProfile)
        {
            try
            {
                using var connection =
                    _dbConnectionFactory.CreateConnection();

                string sql = @"
                    INSERT INTO LearnerProfiles
                    (
                        LearnerId,
                        DateOfBirth,
                        Bio,
                        ProfilePhotoUrl
                    )
                    VALUES
                    (
                        @LearnerId,
                        @DateOfBirth,
                        @Bio,
                        @ProfilePhotoUrl
                    )";

                int rowsAffected =
                    await connection.ExecuteAsync(
                        sql,
                        learnerProfile);

                return rowsAffected > 0;
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(
            int learnerId,
            LearnerProfile learnerProfile)
        {
            try
            {
                using var connection =
                    _dbConnectionFactory.CreateConnection();

                string sql = @"
                    UPDATE LearnerProfiles
                    SET
                        DateOfBirth = @DateOfBirth,
                        Bio = @Bio,
                        ProfilePhotoUrl = @ProfilePhotoUrl
                    WHERE LearnerId = @LearnerId";

                int rowsAffected =
                    await connection.ExecuteAsync(
                        sql,
                        new
                        {
                            LearnerId = learnerId,
                            learnerProfile.DateOfBirth,
                            learnerProfile.Bio,
                            learnerProfile.ProfilePhotoUrl
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
            int learnerId)
        {
            try
            {
                using var connection =
                    _dbConnectionFactory.CreateConnection();

                string sql = @"
                    DELETE FROM LearnerProfiles
                    WHERE LearnerId = @LearnerId";

                int rowsAffected =
                    await connection.ExecuteAsync(
                        sql,
                        new
                        {
                            LearnerId = learnerId
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

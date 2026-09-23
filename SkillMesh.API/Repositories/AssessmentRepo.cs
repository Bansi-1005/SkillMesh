using Dapper;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Models;

namespace SkillMesh.API.Repositories
{
    public class AssessmentRepo : IAssessmentRepo
    {
        private readonly DbConnectionFactory _connectionFactory;

        public AssessmentRepo(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        // GET ALL
        public async Task<IEnumerable<Assessment>> GetAll()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        AssessmentId,
                        AssessmentName,
                        Description,
                        AssessmentType,
                        DurationMinutes,
                        PassingPercentage,
                        IsActive,
                        CreatedAt
                    FROM Assessments
                    ORDER BY AssessmentId DESC";

                return await connection.QueryAsync<Assessment>(sql);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BY ID
        public async Task<Assessment?> GetById(int id)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    SELECT
                        AssessmentId,
                        AssessmentName,
                        Description,
                        AssessmentType,
                        DurationMinutes,
                        PassingPercentage,
                        IsActive,
                        CreatedAt
                    FROM Assessments
                    WHERE AssessmentId = @Id";

                return await connection.QueryFirstOrDefaultAsync<Assessment>(
                    sql,
                    new
                    {
                        Id = id
                    });
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE
        public async Task<int> Create(Assessment assessment)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    INSERT INTO Assessments
                    (
                        AssessmentName,
                        Description,
                        AssessmentType,
                        DurationMinutes,
                        PassingPercentage
                    )
                    VALUES
                    (
                        @AssessmentName,
                        @Description,
                        @AssessmentType,
                        @DurationMinutes,
                        @PassingPercentage
                    );

                    SELECT CAST(SCOPE_IDENTITY() AS INT);";

                return await connection.ExecuteScalarAsync<int>(
                    sql,
                    assessment);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(
            int id,
            Assessment assessment)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string sql = @"
                    UPDATE Assessments
                    SET
                        AssessmentName = @AssessmentName,
                        Description = @Description,
                        AssessmentType = @AssessmentType,
                        DurationMinutes = @DurationMinutes,
                        PassingPercentage = @PassingPercentage,
                        IsActive = @IsActive
                    WHERE AssessmentId = @Id";

                int rows = await connection.ExecuteAsync(
                    sql,
                    new
                    {
                        Id = id,
                        assessment.AssessmentName,
                        assessment.Description,
                        assessment.AssessmentType,
                        assessment.DurationMinutes,
                        assessment.PassingPercentage,
                        assessment.IsActive
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
                    DELETE FROM Assessments
                    WHERE AssessmentId = @Id";

                int rows = await connection.ExecuteAsync(
                    sql,
                    new
                    {
                        Id = id
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

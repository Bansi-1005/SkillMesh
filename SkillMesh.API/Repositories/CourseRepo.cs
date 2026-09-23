using Dapper;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Models;

namespace SkillMesh.API.Repositories
{
    public class CourseRepo : ICourseRepo
    {
        private readonly DbConnectionFactory _connectionFactory;

        public CourseRepo(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Course>> GetAll()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string query = @"
                    SELECT
                        CourseId,
                        CreatedByUserId,
                        CourseName,
                        Description,
                        Difficulty,
                        DurationHours,
                        IsPublished,
                        CreatedAt
                    FROM Courses
                    ORDER BY CourseId DESC";

                return await connection.QueryAsync<Course>(query);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<Course?> GetById(int id)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string query = @"
                    SELECT
                        CourseId,
                        CreatedByUserId,
                        CourseName,
                        Description,
                        Difficulty,
                        DurationHours,
                        IsPublished,
                        CreatedAt
                    FROM Courses
                    WHERE CourseId = @Id";

                return await connection.QueryFirstOrDefaultAsync<Course>(
                    query,
                    new { Id = id }
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<int> Create(Course course)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string query = @"
                    INSERT INTO Courses
                    (
                        CreatedByUserId,
                        CourseName,
                        Description,
                        Difficulty,
                        DurationHours
                    )
                    VALUES
                    (
                        @CreatedByUserId,
                        @CourseName,
                        @Description,
                        @Difficulty,
                        @DurationHours
                    );

                    SELECT CAST(SCOPE_IDENTITY() AS INT);";

                return await connection.ExecuteScalarAsync<int>(
                    query,
                    course
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(int id, Course course)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string query = @"
                    UPDATE Courses
                    SET
                        CourseName = @CourseName,
                        Description = @Description,
                        Difficulty = @Difficulty,
                        DurationHours = @DurationHours,
                        IsPublished = @IsPublished
                    WHERE CourseId = @Id";

                int rowsAffected = await connection.ExecuteAsync(
                    query,
                    new
                    {
                        Id = id,
                        course.CourseName,
                        course.Description,
                        course.Difficulty,
                        course.DurationHours,
                        course.IsPublished
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
                    DELETE FROM Courses
                    WHERE CourseId = @Id";

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

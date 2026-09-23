using Dapper;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Models;

namespace SkillMesh.API.Repositories
{
    public class ProjectRepo : IProjectRepo
    {
        private readonly DbConnectionFactory _connectionFactory;

        public ProjectRepo(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Project>> GetAll()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string query = @"
                    SELECT
                        ProjectId,
                        CreatedByUserId,
                        ProjectName,
                        Description,
                        Difficulty,
                        IsActive,
                        CreatedAt
                    FROM Projects
                    ORDER BY ProjectId DESC";

                return await connection.QueryAsync<Project>(query);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<Project?> GetById(int id)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string query = @"
                    SELECT
                        ProjectId,
                        CreatedByUserId,
                        ProjectName,
                        Description,
                        Difficulty,
                        IsActive,
                        CreatedAt
                    FROM Projects
                    WHERE ProjectId = @Id";

                return await connection.QueryFirstOrDefaultAsync<Project>(
                    query,
                    new { Id = id }
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<int> Create(Project project)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string query = @"
                    INSERT INTO Projects
                    (
                        CreatedByUserId,
                        ProjectName,
                        Description,
                        Difficulty
                    )
                    VALUES
                    (
                        @CreatedByUserId,
                        @ProjectName,
                        @Description,
                        @Difficulty
                    );

                    SELECT CAST(SCOPE_IDENTITY() AS INT);";

                return await connection.ExecuteScalarAsync<int>(
                    query,
                    project
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(int id, Project project)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                string query = @"
                    UPDATE Projects
                    SET
                        ProjectName = @ProjectName,
                        Description = @Description,
                        Difficulty = @Difficulty,
                        IsActive = @IsActive
                    WHERE ProjectId = @Id";

                int rowsAffected = await connection.ExecuteAsync(
                    query,
                    new
                    {
                        Id = id,
                        project.ProjectName,
                        project.Description,
                        project.Difficulty,
                        project.IsActive
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
                    DELETE FROM Projects
                    WHERE ProjectId = @Id";

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

using SkillMesh.API.DTOs.Projects;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Models;

namespace SkillMesh.API.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepo _projectRepo;

        public ProjectService(IProjectRepo projectRepo)
        {
            _projectRepo = projectRepo;
        }

        public async Task<IEnumerable<Project>> GetAll()
        {
            try
            {
                return await _projectRepo.GetAll();
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
                return await _projectRepo.GetById(id);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<int> Create(ProjectCreateDto dto)
        {
            try
            {
                Project project = new Project
                {
                    CreatedByUserId = dto.CreatedByUserId,
                    ProjectName = dto.ProjectName,
                    Description = dto.Description,
                    Difficulty = dto.Difficulty,
                    IsActive = true
                };

                return await _projectRepo.Create(project);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(
            int id,
            ProjectUpdateDto dto)
        {
            try
            {
                Project project = new Project
                {
                    ProjectName = dto.ProjectName,
                    Description = dto.Description,
                    Difficulty = dto.Difficulty,
                    IsActive = dto.IsActive
                };

                return await _projectRepo.Update(id, project);
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
                return await _projectRepo.Delete(id);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

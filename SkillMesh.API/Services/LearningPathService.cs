using SkillMesh.API.DTOs.LearningPaths;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Models;

namespace SkillMesh.API.Services
{
    public class LearningPathService : ILearningPathService
    {
        private readonly ILearningPathRepo _learningPathRepo;

        public LearningPathService(
            ILearningPathRepo learningPathRepo)
        {
            _learningPathRepo = learningPathRepo;
        }

        public async Task<IEnumerable<LearningPath>> GetAll()
        {
            try
            {
                return await _learningPathRepo.GetAll();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<LearningPath?> GetById(int id)
        {
            try
            {
                return await _learningPathRepo.GetById(id);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<int> Create(LearningPathCreateDto dto)
        {
            try
            {
                LearningPath learningPath = new LearningPath
                {
                    JobRoleId = dto.JobRoleId,
                    PathName = dto.PathName,
                    Description = dto.Description,
                    IsActive = true
                };

                return await _learningPathRepo.Create(learningPath);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(
            int id,
            LearningPathUpdateDto dto)
        {
            try
            {
                LearningPath learningPath = new LearningPath
                {
                    JobRoleId = dto.JobRoleId,
                    PathName = dto.PathName,
                    Description = dto.Description,
                    IsActive = dto.IsActive
                };

                return await _learningPathRepo.Update(
                    id,
                    learningPath
                );
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
                return await _learningPathRepo.Delete(id);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

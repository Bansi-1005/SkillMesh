using SkillMesh.API.DTOs.SkillLevels;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Models;

namespace SkillMesh.API.Services
{
    public class SkillLevelService : ISkillLevelService
    {
        private readonly ISkillLevelRepo _repository;

        public SkillLevelService(ISkillLevelRepo repository)
        {
            _repository = repository;
        }

        // GET ALL
        public async Task<IEnumerable<SkillLevel>> GetAll()
        {
            try
            {
                return await _repository.GetAll();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BY ID
        public async Task<SkillLevel?> GetById(int id)
        {
            try
            {
                return await _repository.GetById(id);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE
        public async Task<int> Create(SkillLevelCreateDto dto)
        {
            try
            {
                SkillLevel skillLevel = new SkillLevel
                {
                    LevelNumber = dto.LevelNumber,
                    LevelName = dto.LevelName,
                    Description = dto.Description
                };

                return await _repository.Create(skillLevel);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(
            int id,
            SkillLevelUpdateDto dto)
        {
            try
            {
                SkillLevel skillLevel = new SkillLevel
                {
                    LevelNumber = dto.LevelNumber,
                    LevelName = dto.LevelName,
                    Description = dto.Description
                };

                return await _repository.Update(id, skillLevel);
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
                return await _repository.Delete(id);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

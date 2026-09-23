using SkillMesh.API.DTOs.Skills;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Models;

namespace SkillMesh.API.Services
{
    public class SkillService : ISkillService
    {
        private readonly ISkillRepo _repository;

        public SkillService(ISkillRepo repository)
        {
            _repository = repository;
        }

        // GET ALL
        public async Task<IEnumerable<Skill>> GetAll()
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
        public async Task<Skill?> GetById(int id)
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
        public async Task<int> Create(SkillCreateDto dto)
        {
            try
            {
                Skill skill = new Skill
                {
                    SkillCategoryId = dto.SkillCategoryId,
                    SkillName = dto.SkillName,
                    Description = dto.Description,
                    IsActive = true
                };

                return await _repository.Create(skill);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(
            int id,
            SkillUpdateDto dto)
        {
            try
            {
                Skill skill = new Skill
                {
                    SkillCategoryId = dto.SkillCategoryId,
                    SkillName = dto.SkillName,
                    Description = dto.Description,
                    IsActive = dto.IsActive
                };

                return await _repository.Update(id, skill);
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

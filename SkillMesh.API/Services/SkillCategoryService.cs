using SkillMesh.API.DTOs.SkillCategories;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Models;

namespace SkillMesh.API.Services
{
    public class SkillCategoryService : ISkillCategoryService
    {
        private readonly ISkillCategoryRepo _repository;

        public SkillCategoryService(
            ISkillCategoryRepo repository)
        {
            _repository = repository;
        }

        // GET ALL
        public async Task<IEnumerable<SkillCategory>> GetAll()
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
        public async Task<SkillCategory?> GetById(int id)
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
        public async Task<int> Create(
            SkillCategoryCreateDto dto)
        {
            try
            {
                SkillCategory skillCategory =
                    new SkillCategory
                    {
                        CategoryName = dto.CategoryName,
                        Description = dto.Description,
                        IsActive = true
                    };

                return await _repository.Create(
                    skillCategory);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(
            int id,
            SkillCategoryUpdateDto dto)
        {
            try
            {
                SkillCategory skillCategory =
                    new SkillCategory
                    {
                        CategoryName = dto.CategoryName,
                        Description = dto.Description,
                        IsActive = dto.IsActive
                    };

                return await _repository.Update(
                    id,
                    skillCategory);
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

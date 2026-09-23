using SkillMesh.API.DTOs.SkillCategories;
using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface ISkillCategoryService
    {
        Task<IEnumerable<SkillCategory>> GetAll();

        Task<SkillCategory?> GetById(int id);

        Task<int> Create(SkillCategoryCreateDto dto);

        Task<bool> Update(int id, SkillCategoryUpdateDto dto);

        Task<bool> Delete(int id);
    }
}

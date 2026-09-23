using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IRepos
{
    public interface ISkillCategoryRepo
    {
        Task<IEnumerable<SkillCategory>> GetAll();

        Task<SkillCategory?> GetById(int id);

        Task<int> Create(SkillCategory skillCategory);

        Task<bool> Update(int id, SkillCategory skillCategory);

        Task<bool> Delete(int id);
    }
}

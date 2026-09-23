using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IRepos
{
    public interface ISkillLevelRepo
    {
        Task<IEnumerable<SkillLevel>> GetAll();

        Task<SkillLevel?> GetById(int id);

        Task<int> Create(SkillLevel skillLevel);

        Task<bool> Update(int id, SkillLevel skillLevel);

        Task<bool> Delete(int id);
    }
}

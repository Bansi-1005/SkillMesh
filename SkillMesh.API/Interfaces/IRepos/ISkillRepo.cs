using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IRepos
{
    public interface ISkillRepo
    {
        Task<IEnumerable<Skill>> GetAll();

        Task<Skill?> GetById(int id);

        Task<int> Create(Skill skill);

        Task<bool> Update(int id, Skill skill);

        Task<bool> Delete(int id);
    }
}

using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IRepos
{
    public interface ISkillRelationshipRepo
    {
        Task<IEnumerable<SkillRelationship>> GetAll();

        Task<SkillRelationship?> GetById(int id);

        Task<int> Create(SkillRelationship skillRelationship);

        Task<bool> Update(int id, SkillRelationship skillRelationship);

        Task<bool> Delete(int id);
    }
}

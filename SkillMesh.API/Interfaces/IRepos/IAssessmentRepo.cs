using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IRepos
{
    public interface IAssessmentRepo
    {
        Task<IEnumerable<Assessment>> GetAll();

        Task<Assessment?> GetById(int id);

        Task<int> Create(Assessment assessment);

        Task<bool> Update(int id, Assessment assessment);

        Task<bool> Delete(int id);
    }
}

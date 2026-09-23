using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IRepos
{
    public interface IProjectRepo
    {
        Task<IEnumerable<Project>> GetAll();
        Task<Project?> GetById(int id);
        Task<int> Create(Project project);
        Task<bool> Update(int id, Project project);
        Task<bool> Delete(int id);
    }
}

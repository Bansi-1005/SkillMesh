using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IRepos
{
    public interface IJobRoleRepo
    {
        Task<IEnumerable<JobRole>> GetAll();

        Task<JobRole?> GetById(int id);

        Task<int> Create(JobRole jobRole);

        Task<bool> Update(int id, JobRole jobRole);

        Task<bool> Delete(int id);
    }
}

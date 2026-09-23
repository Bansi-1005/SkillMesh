using SkillMesh.API.DTOs.JobRoles;
using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface IJobRoleService
    {
        Task<IEnumerable<JobRole>> GetAll();

        Task<JobRole?> GetById(int id);

        Task<int> Create(JobRoleCreateDto dto);

        Task<bool> Update(int id, JobRoleUpdateDto dto);

        Task<bool> Delete(int id);
    }
}

using SkillMesh.API.DTOs.JobRoleSkills;
using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface IJobRoleSkillService
    {
        Task<IEnumerable<JobRoleSkill>> GetAll();

        Task<JobRoleSkill?> GetById(int jobRoleId, int skillId);

        Task<bool> Create(JobRoleSkillCreateDto dto);

        Task<bool> Update(int jobRoleId, int skillId, JobRoleSkillUpdateDto dto);

        Task<bool> Delete(int jobRoleId, int skillId);
    }
}

using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IRepos
{
    public interface IJobRoleSkillRepo
    {
        Task<IEnumerable<JobRoleSkill>> GetAll();

        Task<JobRoleSkill?> GetById(int jobRoleId, int skillId);

        Task<bool> Create(JobRoleSkill jobRoleSkill);

        Task<bool> Update(int jobRoleId, int skillId, JobRoleSkill jobRoleSkill);

        Task<bool> Delete(int jobRoleId, int skillId);
    }
}

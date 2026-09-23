using SkillMesh.API.DTOs.JobRoleSkills;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Models;

namespace SkillMesh.API.Services
{
    public class JobRoleSkillService : IJobRoleSkillService
    {
        private readonly IJobRoleSkillRepo _jobRoleSkillRepo;

        public JobRoleSkillService(
            IJobRoleSkillRepo jobRoleSkillRepo)
        {
            _jobRoleSkillRepo = jobRoleSkillRepo;
        }

        // GET ALL
        public async Task<IEnumerable<JobRoleSkill>> GetAll()
        {
            try
            {
                return await _jobRoleSkillRepo.GetAll();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BY ID
        public async Task<JobRoleSkill?> GetById(
            int jobRoleId,
            int skillId)
        {
            try
            {
                return await _jobRoleSkillRepo.GetById(
                    jobRoleId,
                    skillId);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE
        public async Task<bool> Create(
            JobRoleSkillCreateDto dto)
        {
            try
            {
                JobRoleSkill jobRoleSkill =
                    new JobRoleSkill
                    {
                        JobRoleId = dto.JobRoleId,
                        SkillId = dto.SkillId,
                        RequiredSkillLevelId =
                            dto.RequiredSkillLevelId,
                        IsMandatory = dto.IsMandatory
                    };

                return await _jobRoleSkillRepo.Create(
                    jobRoleSkill);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(
            int jobRoleId,
            int skillId,
            JobRoleSkillUpdateDto dto)
        {
            try
            {
                JobRoleSkill jobRoleSkill =
                    new JobRoleSkill
                    {
                        RequiredSkillLevelId =
                            dto.RequiredSkillLevelId,
                        IsMandatory =
                            dto.IsMandatory
                    };

                return await _jobRoleSkillRepo.Update(
                    jobRoleId,
                    skillId,
                    jobRoleSkill);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // DELETE
        public async Task<bool> Delete(
            int jobRoleId,
            int skillId)
        {
            try
            {
                return await _jobRoleSkillRepo.Delete(
                    jobRoleId,
                    skillId);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

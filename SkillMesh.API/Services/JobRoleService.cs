using SkillMesh.API.DTOs.JobRoles;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Models;

namespace SkillMesh.API.Services
{
    public class JobRoleService : IJobRoleService
    {
        private readonly IJobRoleRepo _jobRoleRepo;

        public JobRoleService(IJobRoleRepo jobRoleRepo)
        {
            _jobRoleRepo = jobRoleRepo;
        }

        // GET ALL
        public async Task<IEnumerable<JobRole>> GetAll()
        {
            try
            {
                return await _jobRoleRepo.GetAll();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BY ID
        public async Task<JobRole?> GetById(int id)
        {
            try
            {
                return await _jobRoleRepo.GetById(id);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE
        public async Task<int> Create(JobRoleCreateDto dto)
        {
            try
            {
                JobRole jobRole = new JobRole
                {
                    JobRoleName = dto.JobRoleName,
                    Description = dto.Description,
                    IsActive = true
                };

                return await _jobRoleRepo.Create(jobRole);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(int id, JobRoleUpdateDto dto)
        {
            try
            {
                JobRole jobRole = new JobRole
                {
                    JobRoleName = dto.JobRoleName,
                    Description = dto.Description,
                    IsActive = dto.IsActive
                };

                return await _jobRoleRepo.Update(id, jobRole);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // DELETE
        public async Task<bool> Delete(int id)
        {
            try
            {
                return await _jobRoleRepo.Delete(id);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

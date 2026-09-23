using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.JobRoleSkills;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobRoleSkillController : ControllerBase
    {
        private readonly IJobRoleSkillService
            _jobRoleSkillService;

        public JobRoleSkillController(
            IJobRoleSkillService jobRoleSkillService)
        {
            _jobRoleSkillService = jobRoleSkillService;
        }

        // GET: api/JobRoleSkill
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var jobRoleSkills =
                    await _jobRoleSkillService.GetAll();

                return Ok(jobRoleSkills);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while getting job role skills. "
                    + ex.Message);
            }
        }

        // GET:
        // api/JobRoleSkill/1/1
        [HttpGet("{jobRoleId}/{skillId}")]
        public async Task<IActionResult> GetById(
            int jobRoleId,
            int skillId)
        {
            try
            {
                var jobRoleSkill =
                    await _jobRoleSkillService.GetById(
                        jobRoleId,
                        skillId);

                if (jobRoleSkill == null)
                {
                    return NotFound(
                        "Job role skill not found.");
                }

                return Ok(jobRoleSkill);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while getting job role skill. "
                    + ex.Message);
            }
        }

        // POST:
        // api/JobRoleSkill
        [HttpPost]
        public async Task<IActionResult> Create(
            JobRoleSkillCreateDto dto)
        {
            try
            {
                bool result =
                    await _jobRoleSkillService.Create(dto);

                if (!result)
                {
                    return BadRequest(
                        "Job role skill could not be created.");
                }

                return Ok(
                    "Job role skill created successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while creating job role skill. "
                    + ex.Message);
            }
        }

        // PUT:
        // api/JobRoleSkill/1/1
        [HttpPut("{jobRoleId}/{skillId}")]
        public async Task<IActionResult> Update(
            int jobRoleId,
            int skillId,
            JobRoleSkillUpdateDto dto)
        {
            try
            {
                bool result =
                    await _jobRoleSkillService.Update(
                        jobRoleId,
                        skillId,
                        dto);

                if (!result)
                {
                    return NotFound(
                        "Job role skill not found.");
                }

                return Ok(
                    "Job role skill updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while updating job role skill. "
                    + ex.Message);
            }
        }

        // DELETE:
        // api/JobRoleSkill/1/1
        [HttpDelete("{jobRoleId}/{skillId}")]
        public async Task<IActionResult> Delete(
            int jobRoleId,
            int skillId)
        {
            try
            {
                bool result =
                    await _jobRoleSkillService.Delete(
                        jobRoleId,
                        skillId);

                if (!result)
                {
                    return NotFound(
                        "Job role skill not found.");
                }

                return Ok(
                    "Job role skill deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while deleting job role skill. "
                    + ex.Message);
            }
        }
    }
}

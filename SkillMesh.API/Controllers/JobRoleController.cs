using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.JobRoles;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobRoleController : ControllerBase
    {
        private readonly IJobRoleService _jobRoleService;

        public JobRoleController(IJobRoleService jobRoleService)
        {
            _jobRoleService = jobRoleService;
        }

        // GET: api/JobRole
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var jobRoles = await _jobRoleService.GetAll();

                return Ok(jobRoles);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while getting job roles. " + ex.Message
                );
            }
        }

        // GET: api/JobRole/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var jobRole = await _jobRoleService.GetById(id);

                if (jobRole == null)
                {
                    return NotFound("Job role not found.");
                }

                return Ok(jobRole);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while getting job role. " + ex.Message
                );
            }
        }

        // POST: api/JobRole
        [HttpPost]
        public async Task<IActionResult> Create(
            JobRoleCreateDto dto)
        {
            try
            {
                int id = await _jobRoleService.Create(dto);

                return Ok(new
                {
                    message = "Job role created successfully.",
                    jobRoleId = id
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while creating job role. " + ex.Message
                );
            }
        }

        // PUT: api/JobRole/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            JobRoleUpdateDto dto)
        {
            try
            {
                bool result = await _jobRoleService.Update(id, dto);

                if (!result)
                {
                    return NotFound("Job role not found.");
                }

                return Ok("Job role updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while updating job role. " + ex.Message
                );
            }
        }

        // DELETE: api/JobRole/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                bool result = await _jobRoleService.Delete(id);

                if (!result)
                {
                    return NotFound("Job role not found.");
                }

                return Ok("Job role deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while deleting job role. " + ex.Message
                );
            }
        }
    }
}

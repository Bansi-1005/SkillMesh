using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.Projects;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        // GET: api/Project
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var projects = await _projectService.GetAll();

                return Ok(projects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET: api/Project/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var project = await _projectService.GetById(id);

                if (project == null)
                {
                    return NotFound("Project not found.");
                }

                return Ok(project);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // POST: api/Project
        [HttpPost]
        public async Task<IActionResult> Create(
            ProjectCreateDto dto)
        {
            try
            {
                int projectId =
                    await _projectService.Create(dto);

                return Ok(new
                {
                    message = "Project created successfully.",
                    projectId = projectId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // PUT: api/Project/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            ProjectUpdateDto dto)
        {
            try
            {
                bool result =
                    await _projectService.Update(id, dto);

                if (!result)
                {
                    return NotFound("Project not found.");
                }

                return Ok("Project updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // DELETE: api/Project/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                bool result =
                    await _projectService.Delete(id);

                if (!result)
                {
                    return NotFound("Project not found.");
                }

                return Ok("Project deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

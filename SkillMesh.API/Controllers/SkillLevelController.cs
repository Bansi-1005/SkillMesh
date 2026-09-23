using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.SkillLevels;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SkillLevelController : ControllerBase
    {
        private readonly ISkillLevelService _service;

        public SkillLevelController(ISkillLevelService service)
        {
            _service = service;
        }

        // GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var skillLevels = await _service.GetAll();

                return Ok(skillLevels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while getting skill levels.",
                    Error = ex.Message
                });
            }
        }

        // GET BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var skillLevel = await _service.GetById(id);

                if (skillLevel == null)
                {
                    return NotFound("Skill level not found.");
                }

                return Ok(skillLevel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while getting skill level.",
                    Error = ex.Message
                });
            }
        }

        // CREATE
        [HttpPost]
        public async Task<IActionResult> Create(
            SkillLevelCreateDto dto)
        {
            try
            {
                int id = await _service.Create(dto);

                return Ok(new
                {
                    Message = "Skill level created successfully.",
                    SkillLevelId = id
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while creating skill level.",
                    Error = ex.Message
                });
            }
        }

        // UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            SkillLevelUpdateDto dto)
        {
            try
            {
                bool result = await _service.Update(id, dto);

                if (!result)
                {
                    return NotFound("Skill level not found.");
                }

                return Ok("Skill level updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while updating skill level.",
                    Error = ex.Message
                });
            }
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                bool result = await _service.Delete(id);

                if (!result)
                {
                    return NotFound("Skill level not found.");
                }

                return Ok("Skill level deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while deleting skill level.",
                    Error = ex.Message
                });
            }
        }
    }
}

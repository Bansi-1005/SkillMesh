using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.Skills;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SkillController : ControllerBase
    {
        private readonly ISkillService _service;

        public SkillController(ISkillService service)
        {
            _service = service;
        }

        // GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var skills = await _service.GetAll();

                return Ok(skills);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while getting skills.",
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
                var skill = await _service.GetById(id);

                if (skill == null)
                {
                    return NotFound("Skill not found.");
                }

                return Ok(skill);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while getting skill.",
                    Error = ex.Message
                });
            }
        }

        // CREATE
        [HttpPost]
        public async Task<IActionResult> Create(
            SkillCreateDto dto)
        {
            try
            {
                int id = await _service.Create(dto);

                return Ok(new
                {
                    Message = "Skill created successfully.",
                    SkillId = id
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while creating skill.",
                    Error = ex.Message
                });
            }
        }

        // UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            SkillUpdateDto dto)
        {
            try
            {
                bool result = await _service.Update(id, dto);

                if (!result)
                {
                    return NotFound("Skill not found.");
                }

                return Ok("Skill updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while updating skill.",
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
                    return NotFound("Skill not found.");
                }

                return Ok("Skill deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while deleting skill.",
                    Error = ex.Message
                });
            }
        }
    }
}

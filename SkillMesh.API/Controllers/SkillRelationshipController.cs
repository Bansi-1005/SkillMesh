using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.SkillRelationships;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SkillRelationshipController : ControllerBase
    {
        private readonly ISkillRelationshipService _skillRelationshipService;

        public SkillRelationshipController(
            ISkillRelationshipService skillRelationshipService)
        {
            _skillRelationshipService = skillRelationshipService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var data = await _skillRelationshipService.GetAll();

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while getting skill relationships. " + ex.Message
                );
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var data = await _skillRelationshipService.GetById(id);

                if (data == null)
                {
                    return NotFound("Skill relationship not found.");
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while getting skill relationship. " + ex.Message
                );
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            SkillRelationshipCreateDto dto)
        {
            try
            {
                int id = await _skillRelationshipService.Create(dto);

                return Ok(new
                {
                    message = "Skill relationship created successfully.",
                    skillRelationshipId = id
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while creating skill relationship. " + ex.Message
                );
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            SkillRelationshipUpdateDto dto)
        {
            try
            {
                bool result =
                    await _skillRelationshipService.Update(id, dto);

                if (!result)
                {
                    return NotFound("Skill relationship not found.");
                }

                return Ok(
                    "Skill relationship updated successfully."
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while updating skill relationship. " + ex.Message
                );
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                bool result =
                    await _skillRelationshipService.Delete(id);

                if (!result)
                {
                    return NotFound("Skill relationship not found.");
                }

                return Ok(
                    "Skill relationship deleted successfully."
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while deleting skill relationship. " + ex.Message
                );
            }
        }

    }
}

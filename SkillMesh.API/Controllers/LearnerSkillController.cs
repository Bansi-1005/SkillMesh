using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.LearnerSkills;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LearnerSkillController : ControllerBase
    {
        private readonly ILearnerSkillService _learnerSkillService;

        public LearnerSkillController(
            ILearnerSkillService learnerSkillService)
        {
            _learnerSkillService = learnerSkillService;
        }

        // GET: api/LearnerSkill
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _learnerSkillService.GetAll();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while fetching learner skills: " + ex.Message);
            }
        }

        // GET: api/LearnerSkill/4/1
        [HttpGet("{learnerId}/{skillId}")]
        public async Task<IActionResult> GetById(
            int learnerId,
            int skillId)
        {
            try
            {
                var result = await _learnerSkillService.GetById(
                    learnerId,
                    skillId);

                if (result == null)
                {
                    return NotFound("Learner skill not found.");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while fetching learner skill: " + ex.Message);
            }
        }

        // POST: api/LearnerSkill
        [HttpPost]
        public async Task<IActionResult> Create(
            LearnerSkillCreateDto dto)
        {
            try
            {
                bool result = await _learnerSkillService.Create(dto);

                if (!result)
                {
                    return BadRequest("Learner skill could not be created.");
                }

                return Ok("Learner skill created successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while creating learner skill: " + ex.Message);
            }
        }

        // PUT: api/LearnerSkill/4/1
        [HttpPut("{learnerId}/{skillId}")]
        public async Task<IActionResult> Update(
            int learnerId,
            int skillId,
            LearnerSkillUpdateDto dto)
        {
            try
            {
                bool result = await _learnerSkillService.Update(
                    learnerId,
                    skillId,
                    dto);

                if (!result)
                {
                    return NotFound("Learner skill not found.");
                }

                return Ok("Learner skill updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while updating learner skill: " + ex.Message);
            }
        }

        // DELETE: api/LearnerSkill/4/1
        [HttpDelete("{learnerId}/{skillId}")]
        public async Task<IActionResult> Delete(
            int learnerId,
            int skillId)
        {
            try
            {
                bool result = await _learnerSkillService.Delete(
                    learnerId,
                    skillId);

                if (!result)
                {
                    return NotFound("Learner skill not found.");
                }

                return Ok("Learner skill deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while deleting learner skill: " + ex.Message);
            }
        }
    }
}

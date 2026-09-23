using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.LearnerProfiles;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LearnerProfileController : ControllerBase
    {
        private readonly ILearnerProfileService
            _learnerProfileService;

        public LearnerProfileController(
            ILearnerProfileService learnerProfileService)
        {
            _learnerProfileService =
                learnerProfileService;
        }

        // GET: api/LearnerProfile
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var learnerProfiles =
                    await _learnerProfileService.GetAll();

                return Ok(learnerProfiles);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while getting learner profiles. "
                    + ex.Message);
            }
        }

        // GET: api/LearnerProfile/4
        [HttpGet("{learnerId}")]
        public async Task<IActionResult> GetById(
            int learnerId)
        {
            try
            {
                var learnerProfile =
                    await _learnerProfileService.GetById(
                        learnerId);

                if (learnerProfile == null)
                {
                    return NotFound(
                        "Learner profile not found.");
                }

                return Ok(learnerProfile);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while getting learner profile. "
                    + ex.Message);
            }
        }

        // POST: api/LearnerProfile
        [HttpPost]
        public async Task<IActionResult> Create(
            LearnerProfileCreateDto dto)
        {
            try
            {
                bool result =
                    await _learnerProfileService.Create(dto);

                if (!result)
                {
                    return BadRequest(
                        "Learner profile could not be created.");
                }

                return Ok(
                    "Learner profile created successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while creating learner profile. "
                    + ex.Message);
            }
        }

        // PUT: api/LearnerProfile/4
        [HttpPut("{learnerId}")]
        public async Task<IActionResult> Update(
            int learnerId,
            LearnerProfileUpdateDto dto)
        {
            try
            {
                bool result =
                    await _learnerProfileService.Update(
                        learnerId,
                        dto);

                if (!result)
                {
                    return NotFound(
                        "Learner profile not found.");
                }

                return Ok(
                    "Learner profile updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while updating learner profile. "
                    + ex.Message);
            }
        }

        // DELETE: api/LearnerProfile/4
        [HttpDelete("{learnerId}")]
        public async Task<IActionResult> Delete(
            int learnerId)
        {
            try
            {
                bool result =
                    await _learnerProfileService.Delete(
                        learnerId);

                if (!result)
                {
                    return NotFound(
                        "Learner profile not found.");
                }

                return Ok(
                    "Learner profile deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while deleting learner profile. "
                    + ex.Message);
            }
        }
    }
}

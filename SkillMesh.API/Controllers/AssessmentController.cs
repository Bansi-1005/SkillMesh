using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.Assessments;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssessmentController : ControllerBase
    {
        private readonly IAssessmentService _assessmentService;

        public AssessmentController(
            IAssessmentService assessmentService)
        {
            _assessmentService = assessmentService;
        }

        // GET: api/Assessment
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _assessmentService.GetAll();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while fetching assessments: " + ex.Message);
            }
        }

        // GET: api/Assessment/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _assessmentService.GetById(id);

                if (result == null)
                {
                    return NotFound("Assessment not found.");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while fetching assessment: " + ex.Message);
            }
        }

        // POST: api/Assessment
        [HttpPost]
        public async Task<IActionResult> Create(
            AssessmentCreateDto dto)
        {
            try
            {
                int id = await _assessmentService.Create(dto);

                return Ok(new
                {
                    message = "Assessment created successfully.",
                    assessmentId = id
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while creating assessment: " + ex.Message);
            }
        }

        // PUT: api/Assessment/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            AssessmentUpdateDto dto)
        {
            try
            {
                bool result = await _assessmentService.Update(
                    id,
                    dto);

                if (!result)
                {
                    return NotFound("Assessment not found.");
                }

                return Ok("Assessment updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while updating assessment: " + ex.Message);
            }
        }

        // DELETE: api/Assessment/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                bool result = await _assessmentService.Delete(id);

                if (!result)
                {
                    return NotFound("Assessment not found.");
                }

                return Ok("Assessment deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Error while deleting assessment: " + ex.Message);
            }
        }
    }
}

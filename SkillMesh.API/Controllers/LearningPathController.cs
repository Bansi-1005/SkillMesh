using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.LearningPaths;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LearningPathController : ControllerBase
    {
        private readonly ILearningPathService _learningPathService;

        public LearningPathController(
            ILearningPathService learningPathService)
        {
            _learningPathService = learningPathService;
        }

        // GET: api/LearningPath
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var learningPaths =
                    await _learningPathService.GetAll();

                return Ok(learningPaths);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET: api/LearningPath/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var learningPath =
                    await _learningPathService.GetById(id);

                if (learningPath == null)
                {
                    return NotFound("Learning path not found.");
                }

                return Ok(learningPath);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // POST: api/LearningPath
        [HttpPost]
        public async Task<IActionResult> Create(
            LearningPathCreateDto dto)
        {
            try
            {
                int learningPathId =
                    await _learningPathService.Create(dto);

                return Ok(new
                {
                    message = "Learning path created successfully.",
                    learningPathId = learningPathId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // PUT: api/LearningPath/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            LearningPathUpdateDto dto)
        {
            try
            {
                bool result =
                    await _learningPathService.Update(id, dto);

                if (!result)
                {
                    return NotFound("Learning path not found.");
                }

                return Ok("Learning path updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // DELETE: api/LearningPath/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                bool result =
                    await _learningPathService.Delete(id);

                if (!result)
                {
                    return NotFound("Learning path not found.");
                }

                return Ok("Learning path deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.SkillCategories;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SkillCategoryController : ControllerBase
    {
        private readonly ISkillCategoryService _service;

        public SkillCategoryController(
            ISkillCategoryService service)
        {
            _service = service;
        }

        // GET: api/SkillCategory
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var categories =
                    await _service.GetAll();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        Message = "Error while getting skill categories.",
                        Error = ex.Message
                    });
            }
        }

        // GET: api/SkillCategory/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var category =
                    await _service.GetById(id);

                if (category == null)
                {
                    return NotFound(
                        "Skill category not found.");
                }

                return Ok(category);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        Message = "Error while getting skill category.",
                        Error = ex.Message
                    });
            }
        }

        // POST: api/SkillCategory
        [HttpPost]
        public async Task<IActionResult> Create(
            SkillCategoryCreateDto dto)
        {
            try
            {
                int id =
                    await _service.Create(dto);

                return Ok(
                    new
                    {
                        Message =
                            "Skill category created successfully.",

                        SkillCategoryId = id
                    });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        Message = "Error while creating skill category.",
                        Error = ex.Message
                    });
            }
        }

        // PUT: api/SkillCategory/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            SkillCategoryUpdateDto dto)
        {
            try
            {
                bool result =
                    await _service.Update(id, dto);

                if (!result)
                {
                    return NotFound(
                        "Skill category not found.");
                }

                return Ok(
                    "Skill category updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        Message = "Error while updating skill category.",
                        Error = ex.Message
                    });
            }
        }

        // DELETE: api/SkillCategory/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                bool result =
                    await _service.Delete(id);

                if (!result)
                {
                    return NotFound(
                        "Skill category not found.");
                }

                return Ok(
                    "Skill category deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        Message = "Error while deleting skill category.",
                        Error = ex.Message
                    });
            }
        }
    }
}

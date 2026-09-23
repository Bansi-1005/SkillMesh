using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.Courses;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseController : ControllerBase
    {
        private readonly ICourseService _courseService;

        public CourseController(ICourseService courseService)
        {
            _courseService = courseService;
        }

        // GET: api/Course
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var courses = await _courseService.GetAll();

                return Ok(courses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET: api/Course/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var course = await _courseService.GetById(id);

                if (course == null)
                {
                    return NotFound("Course not found.");
                }

                return Ok(course);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // POST: api/Course
        [HttpPost]
        public async Task<IActionResult> Create(CourseCreateDto dto)
        {
            try
            {
                int courseId = await _courseService.Create(dto);

                return Ok(new
                {
                    message = "Course created successfully.",
                    courseId = courseId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // PUT: api/Course/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            CourseUpdateDto dto)
        {
            try
            {
                bool result = await _courseService.Update(id, dto);

                if (!result)
                {
                    return NotFound("Course not found.");
                }

                return Ok("Course updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // DELETE: api/Course/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                bool result = await _courseService.Delete(id);

                if (!result)
                {
                    return NotFound("Course not found.");
                }

                return Ok("Course deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

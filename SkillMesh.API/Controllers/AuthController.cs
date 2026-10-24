
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.Authentication;
using SkillMesh.API.Helpers;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _service;

        public AuthController(IAuthService service)
        {
            _service = service;
        }

        // =============================================
        // PUBLIC LEARNER SELF-REGISTRATION
        // POST: api/Auth/register/learner
        // =============================================

        [AllowAnonymous]
        [HttpPost("register/learner")]
        public async Task<IActionResult> RegisterLearner(
            [FromBody] RegisterDto dto)
        {
            try
            {
                int userId = await _service.RegisterLearner(dto);

                return Ok(new
                {
                    Message = "Learner registered successfully.",
                    UserId = userId
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    Message = "Unable to register the learner. Please try again."
                });
            }
        }

        // =============================================
        // ADMIN REGISTRATION
        // SUPER ADMIN ONLY
        // POST: api/Auth/register/admin
        // =============================================

        [Authorize(Roles = RoleNames.SuperAdmin)]
        [HttpPost("register/admin")]
        public async Task<IActionResult> RegisterAdmin(
            [FromBody] RegisterDto dto)
        {
            try
            {
                int userId = await _service.RegisterAdmin(dto);

                return Ok(new
                {
                    Message = "Admin registered successfully.",
                    UserId = userId
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    Message = "Unable to register the Admin. Please check the details and try again."
                });
            }
        }

        // =============================================
        // LOGIN
        // POST: api/Auth/login
        // =============================================

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] LoginDto dto)
        {
            var result = await _service.Login(dto);

            if (result == null)
            {
                return Unauthorized(new
                {
                    Message = "Invalid email or password."
                });
            }

            return Ok(result);
        }
    }
}

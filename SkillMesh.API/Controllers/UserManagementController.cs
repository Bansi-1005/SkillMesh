
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.UserManagement;
using SkillMesh.API.Helpers;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = RoleNames.SuperAdmin)]
    public class UserManagementController : ControllerBase
    {
        private readonly IUserManagementService _service;

        public UserManagementController(
            IUserManagementService service)
        {
            _service = service;
        }

        // GET: api/UserManagement/users
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _service.GetUsersAsync();
                return Ok(users);
            }
            catch (InvalidOperationException)
            {
                return StatusCode(500, new
                {
                    Message = "Could not load users due to a server or database error."
                });
            }
        }

        // GET: api/UserManagement/organizations
        [HttpGet("organizations")]
        public async Task<IActionResult> GetOrganizations()
        {
            try
            {
                var organizations =
                    await _service.GetOrganizationsAsync();

                return Ok(organizations);
            }
            catch (InvalidOperationException)
            {
                return StatusCode(500, new
                {
                    Message = "Could not load organizations due to a server or database error."
                });
            }
        }

        // PUT: api/UserManagement/users/5/status
        // Body: { "isActive": false }
        [HttpPut("users/{userId:int}/status")]
        public async Task<IActionResult> UpdateUserStatus(
            int userId,
            [FromBody] UpdateUserStatusDto request)
        {
            if (userId <= 0)
            {
                return BadRequest(new
                {
                    Message = "A valid user ID is required."
                });
            }

            try
            {
                bool updated = await _service.SetUserStatusAsync(
                    userId,
                    request.IsActive);

                if (!updated)
                {
                    return NotFound(new
                    {
                        Message = "The user was not found, or this account's role cannot be changed here. Super Admin accounts cannot be changed through this endpoint."
                    });
                }

                return Ok(new
                {
                    Message = request.IsActive
                        ? "User activated successfully."
                        : "User deactivated successfully.",
                    UserId = userId,
                    IsActive = request.IsActive
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException)
            {
                return StatusCode(500, new
                {
                    Message = "Could not update the user status due to a server or database error."
                });
            }
        }
    }
}

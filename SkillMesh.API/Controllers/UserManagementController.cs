using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.UserManagement;
using SkillMesh.API.Helpers;
using SkillMesh.API.Interfaces.IServices;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;


namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserManagementController : ControllerBase
    {
        private readonly IUserManagementService _service;

        public UserManagementController(
            IUserManagementService service)
        {
            _service = service;
        }

        // GET: api/UserManagement/users
        [Authorize(Roles = RoleNames.SuperAdmin)]
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
        [Authorize(Roles = RoleNames.SuperAdmin)]
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
        [Authorize(Roles = RoleNames.SuperAdmin)]
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



        // GET: api/UserManagement/organization-learners
        [Authorize(Roles = RoleNames.Admin)]
        [HttpGet("organization-learners")]
        public async Task<IActionResult> GetOrganizationLearners()
        {
            string? organizationIdClaim =
                User.FindFirst("OrganizationId")?.Value;

            if (!int.TryParse(
                organizationIdClaim,
                out int organizationId) ||
                organizationId <= 0)
            {
                return Forbid();
            }

            try
            {
                var learners =
                    await _service.GetOrganizationLearnersAsync(
                        organizationId);

                return Ok(learners);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException)
            {
                return StatusCode(500, new
                {
                    Message = "Could not load organization learners."
                });
            }
        }

        // PUT: api/UserManagement/organization-learners/5/status
        // Body: { "isActive": false }
        [Authorize(Roles = RoleNames.Admin)]
        [HttpPut("organization-learners/{userId:int}/status")]
        public async Task<IActionResult> UpdateOrganizationLearnerStatus(
            int userId,
            [FromBody] UpdateUserStatusDto request)
        {
            if (userId <= 0)
            {
                return BadRequest(new
                {
                    Message = "A valid learner ID is required."
                });
            }

            string? organizationIdClaim =
                User.FindFirst("OrganizationId")?.Value;

            if (!int.TryParse(
                organizationIdClaim,
                out int organizationId) ||
                organizationId <= 0)
            {
                return Forbid();
            }

            try
            {
                bool updated =
                    await _service.SetOrganizationLearnerStatusAsync(
                        userId,
                        organizationId,
                        request.IsActive);

                if (!updated)
                {
                    return NotFound(new
                    {
                        Message =
                            "The learner was not found in your organization, or the account is globally inactive."
                    });
                }

                return Ok(new
                {
                    Message = request.IsActive
                        ? "Learner enabled for your organization."
                        : "Learner disabled for your organization.",
                    UserId = userId,
                    OrganizationId = organizationId,
                    AdminIsActive = request.IsActive
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
                    Message = "Could not update the learner status."
                });
            }
        }
    }
}
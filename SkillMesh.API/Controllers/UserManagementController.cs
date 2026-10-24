using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.UserManagement;
using SkillMesh.API.Helpers;
using SkillMesh.API.Interfaces.IServices;

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
        // Only Super Admin can view all users.
        [HttpGet("users")]
        [Authorize(Roles = RoleNames.SuperAdmin)]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                return Ok(await _service.GetUsersAsync());
            }
            catch (InvalidOperationException)
            {
                return StatusCode(500, new
                {
                    message = "Could not load users due to a server or database error."
                });
            }
        }

        // PUT: api/UserManagement/users/{userId}/status
        // Only Super Admin can change general user status.
        [HttpPut("users/{userId:int}/status")]
        [Authorize(Roles = RoleNames.SuperAdmin)]
        public async Task<IActionResult> UpdateUserStatus(
            int userId,
            [FromBody] UpdateUserStatusDto request)
        {
            if (userId <= 0)
            {
                return BadRequest(new
                {
                    message = "A valid user ID is required."
                });
            }

            if (request == null)
            {
                return BadRequest(new
                {
                    message = "Status information is required."
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
                        message = "User not found, or the account cannot be changed."
                    });
                }

                return Ok(new
                {
                    message = request.IsActive
                        ? "User activated successfully."
                        : "User deactivated successfully.",
                    userId,
                    isActive = request.IsActive
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException)
            {
                return StatusCode(500, new
                {
                    message = "Could not update user status due to a server or database error."
                });
            }
        }

        // GET: api/UserManagement/learners
        // Admin and Super Admin can view learners.
        [HttpGet("learners")]
        [Authorize(Roles = RoleNames.SuperAdmin + "," + RoleNames.Admin)]
        public async Task<IActionResult> GetLearners()
        {
            try
            {
                var users = await _service.GetUsersAsync();

                var learners = users
                    .Where(user => user.RoleId == 3)
                    .ToList();

                return Ok(learners);
            }
            catch (InvalidOperationException)
            {
                return StatusCode(500, new
                {
                    message = "Could not load learners due to a server or database error."
                });
            }
        }

        // PUT: api/UserManagement/learners/{userId}/status
        // Super Admin can activate or deactivate.
        // Admin can deactivate active learners only.
        [HttpPut("learners/{userId:int}/status")]
        [Authorize(Roles = RoleNames.SuperAdmin + "," + RoleNames.Admin)]
        public async Task<IActionResult> UpdateLearnerStatus(
            int userId,
            [FromBody] UpdateUserStatusDto request)
        {
            if (userId <= 0)
            {
                return BadRequest(new
                {
                    message = "A valid learner ID is required."
                });
            }

            if (request == null)
            {
                return BadRequest(new
                {
                    message = "Status information is required."
                });
            }

            bool isSuperAdmin = User.IsInRole(RoleNames.SuperAdmin);

            try
            {
                // Verify that the requested account is a learner.
                var users = await _service.GetUsersAsync();

                var learner = users.FirstOrDefault(
                    user => user.UserId == userId && user.RoleId == 3);

                if (learner == null)
                {
                    return NotFound(new
                    {
                        message = "Learner not found."
                    });
                }

                // The service/repository enforces the status policy.
                bool updated = await _service.SetLearnerStatusAsync(
                    userId,
                    request.IsActive,
                    isSuperAdmin);


                if (!updated)
                {
                    return Conflict(new
                    {
                        message = isSuperAdmin
                            ? "The learner status could not be updated. Please refresh and try again."
                            : request.IsActive
                                ? "You cannot reactivate this learner because Super Admin deactivated the account, or the learner status has changed. Contact Super Admin if needed."
                                : "The learner could not be deactivated because the account may already be inactive. Please refresh and try again."
                    });
                }


                return Ok(new
                {
                    message = request.IsActive
                        ? "Learner activated successfully."
                        : isSuperAdmin
                            ? "Learner deactivated by Super Admin successfully."
                            : "Learner deactivated successfully.",
                    userId,
                    isActive = request.IsActive,
                    deactivatedBySuperAdmin =
                        !request.IsActive && isSuperAdmin
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException)
            {
                return StatusCode(500, new
                {
                    message = "Could not update learner status due to a server or database error."
                });
            }
        }
    }
}
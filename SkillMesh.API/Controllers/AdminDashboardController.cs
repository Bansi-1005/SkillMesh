using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IAdminDashboardService _adminDashboardService;

        public AdminDashboardController(
            IAdminDashboardService adminDashboardService)
        {
            _adminDashboardService = adminDashboardService;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdValue, out int adminUserId))
            {
                return Unauthorized(new
                {
                    message = "The logged-in user's ID is missing from the token."
                });
            }

            try
            {
                var dashboard = await _adminDashboardService
                    .GetDashboardAsync(adminUserId);

                return Ok(dashboard);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new
                {
                    message = "The Admin account is invalid or inactive."
                });
            }
        }
    }
}
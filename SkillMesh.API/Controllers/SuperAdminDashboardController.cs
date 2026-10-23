
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Super Admin")]
    public class SuperAdminDashboardController : ControllerBase
    {
        private readonly ISuperAdminDashboardService _dashboardService;

        public SuperAdminDashboardController(
            ISuperAdminDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet]
        public IActionResult GetDashboardData()
        {
            try
            {
                var dashboard = _dashboardService.GetDashboardData();

                return Ok(dashboard);
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "An error occurred while loading the Super Admin dashboard."
                    }
                );
            }
        }
    }
}

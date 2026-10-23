
using SkillMesh.API.DTOs.SuperAdminDashboard;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Services
{
    public class SuperAdminDashboardService
        : ISuperAdminDashboardService
    {
        private readonly ISuperAdminDashboardRepo _dashboardRepo;

        public SuperAdminDashboardService(
            ISuperAdminDashboardRepo dashboardRepo)
        {
            _dashboardRepo = dashboardRepo;
        }

        public SuperAdminDashboardDto GetDashboardData()
        {
            return _dashboardRepo.GetDashboardData();
        }
    }
}

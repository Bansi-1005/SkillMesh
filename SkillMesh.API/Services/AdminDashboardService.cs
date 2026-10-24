using SkillMesh.API.DTOs.AdminDashboard;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Services
{
    public class AdminDashboardService : IAdminDashboardService
    {
        private readonly IAdminDashboardRepo _adminDashboardRepo;

        public AdminDashboardService(IAdminDashboardRepo adminDashboardRepo)
        {
            _adminDashboardRepo = adminDashboardRepo;
        }

        public async Task<AdminDashboardDto> GetDashboardAsync(int adminUserId)
        {
            return await _adminDashboardRepo.GetDashboardAsync(adminUserId);
        }
    }
}
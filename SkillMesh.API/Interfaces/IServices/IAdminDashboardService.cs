using SkillMesh.API.DTOs.AdminDashboard;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface IAdminDashboardService
    {
        Task<AdminDashboardDto> GetDashboardAsync(int adminUserId);
    }
}
using SkillMesh.API.DTOs.AdminDashboard;

namespace SkillMesh.API.Interfaces.IRepos
{
    public interface IAdminDashboardRepo
    {
        Task<AdminDashboardDto> GetDashboardAsync(int adminUserId);
    }
}
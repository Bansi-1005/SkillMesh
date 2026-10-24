using SkillMesh.API.DTOs.UserManagement;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface IUserManagementService
    {
        Task<List<UserListDto>> GetUsersAsync();

        Task<bool> SetUserStatusAsync(
            int userId,
            bool isActive);

        Task<bool> SetLearnerStatusAsync(
            int userId,
            bool isActive,
            bool isSuperAdmin);
    }
}
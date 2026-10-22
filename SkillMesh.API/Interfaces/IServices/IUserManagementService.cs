using SkillMesh.API.DTOs.Organizations;
using SkillMesh.API.DTOs.UserManagement;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface IUserManagementService
    {
        Task<List<UserListDto>> GetUsersAsync();

        Task<List<OrganizationListDto>> GetOrganizationsAsync();

        Task<bool> SetUserStatusAsync(int userId, bool isActive);

    }
}

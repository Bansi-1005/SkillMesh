
using SkillMesh.API.DTOs.Organizations;
using SkillMesh.API.DTOs.UserManagement;

namespace SkillMesh.API.Interfaces.IRepos
{
    public interface IUserManagementRepo
    {
        Task<List<UserListDto>> GetUsersAsync();

        Task<List<OrganizationListDto>> GetOrganizationsAsync();

        Task<bool> SetUserStatusAsync(
            int userId,
            bool isActive);

        Task<IEnumerable<LearnerManagementDto>>
            GetOrganizationLearnersAsync(int organizationId);

        Task<bool> SetOrganizationLearnerStatusAsync(
            int userId,
            int organizationId,
            bool adminIsActive);
    }
}

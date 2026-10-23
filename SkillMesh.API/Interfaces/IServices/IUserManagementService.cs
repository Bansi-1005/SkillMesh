
using SkillMesh.API.DTOs.Organizations;
using SkillMesh.API.DTOs.UserManagement;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface IUserManagementService
    {
        Task<List<UserListDto>> GetUsersAsync();

        Task<List<OrganizationListDto>> GetOrganizationsAsync();

        // Super Admin: global account status
        Task<bool> SetUserStatusAsync(
            int userId,
            bool isActive);

        // Admin: learners belonging to their organization
        Task<IEnumerable<LearnerManagementDto>>
            GetOrganizationLearnersAsync(
                int organizationId);

        // Admin: organization-specific learner status
        Task<bool> SetOrganizationLearnerStatusAsync(
            int userId,
            int organizationId,
            bool adminIsActive);
    }
}

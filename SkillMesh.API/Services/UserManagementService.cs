
using SkillMesh.API.DTOs.Organizations;
using SkillMesh.API.DTOs.UserManagement;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Services
{
    public class UserManagementService : IUserManagementService
    {
        private readonly IUserManagementRepo _repository;

        public UserManagementService(
            IUserManagementRepo repository)
        {
            _repository = repository;
        }

        public Task<List<UserListDto>> GetUsersAsync()
        {
            return _repository.GetUsersAsync();
        }

        public Task<List<OrganizationListDto>>
            GetOrganizationsAsync()
        {
            return _repository.GetOrganizationsAsync();
        }

        // Super Admin: global account activation
        public async Task<bool> SetUserStatusAsync(
            int userId,
            bool isActive)
        {
            if (userId <= 0)
            {
                throw new ArgumentException(
                    "A valid user ID is required.");
            }

            return await _repository.SetUserStatusAsync(
                userId,
                isActive);
        }

        // Admin: list learners in their organization
        public async Task<IEnumerable<LearnerManagementDto>>
            GetOrganizationLearnersAsync(
                int organizationId)
        {
            if (organizationId <= 0)
            {
                throw new ArgumentException(
                    "A valid organization ID is required.");
            }

            return await _repository.GetOrganizationLearnersAsync(
                organizationId);
        }

        // Admin: change only the organization-specific status
        public async Task<bool> SetOrganizationLearnerStatusAsync(
            int userId,
            int organizationId,
            bool adminIsActive)
        {
            if (userId <= 0)
            {
                throw new ArgumentException(
                    "A valid learner ID is required.");
            }

            if (organizationId <= 0)
            {
                throw new ArgumentException(
                    "A valid organization ID is required.");
            }

            return await _repository.SetOrganizationLearnerStatusAsync(
                userId,
                organizationId,
                adminIsActive);
        }
    }
}


using SkillMesh.API.DTOs.Organizations;
using SkillMesh.API.DTOs.UserManagement;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Repositories;

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

        public Task<List<OrganizationListDto>> GetOrganizationsAsync()
        {
            return _repository.GetOrganizationsAsync();
        }

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
    }
}

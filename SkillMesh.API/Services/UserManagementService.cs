using SkillMesh.API.DTOs.UserManagement;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Services
{
    public class UserManagementService : IUserManagementService
    {
        private readonly IUserManagementRepo _repository;

        public UserManagementService(IUserManagementRepo repository)
        {
            _repository = repository;
        }

        public Task<List<UserListDto>> GetUsersAsync()
        {
            return _repository.GetUsersAsync();
        }

        public async Task<bool> SetUserStatusAsync(
            int userId,
            bool isActive)
        {
            ValidateUserId(userId);

            return await _repository.SetUserStatusAsync(
                userId,
                isActive);
        }

        public async Task<bool> SetLearnerStatusAsync(
            int userId,
            bool isActive,
            bool isSuperAdmin)
        {
            ValidateUserId(userId);

            return await _repository.SetLearnerStatusAsync(
                userId,
                isActive,
                isSuperAdmin);
        }

        private static void ValidateUserId(int userId)
        {
            if (userId <= 0)
            {
                throw new ArgumentException(
                    "A valid user ID is required.");
            }
        }
    }
}
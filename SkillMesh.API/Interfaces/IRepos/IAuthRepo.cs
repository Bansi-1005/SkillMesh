
using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IRepos
{
    public interface IAuthRepo
    {
        Task<bool> EmailExists(string email);

        Task<int?> GetRoleIdByName(string roleName);

        Task<int> CreateUser(
            User user,
            bool createLearnerProfile
        );

        Task<User?> GetUserByEmail(string email);
    }
}

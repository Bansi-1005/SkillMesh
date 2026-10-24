
using SkillMesh.API.DTOs.Authentication;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface IAuthService
    {
        Task<int> RegisterLearner(RegisterDto dto);

        Task<int> RegisterAdmin(RegisterDto dto);

        Task<LoginResponseDto?> Login(LoginDto dto);
    }
}

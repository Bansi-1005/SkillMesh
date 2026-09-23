using SkillMesh.API.DTOs.LearnerProfiles;
using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface ILearnerProfileService
    {
        Task<IEnumerable<LearnerProfile>> GetAll();

        Task<LearnerProfile?> GetById(int learnerId);

        Task<bool> Create(LearnerProfileCreateDto dto);

        Task<bool> Update(int learnerId, LearnerProfileUpdateDto dto);

        Task<bool> Delete(int learnerId);
    }
}

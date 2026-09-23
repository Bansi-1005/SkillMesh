using SkillMesh.API.DTOs.LearnerSkills;
using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface ILearnerSkillService
    {
        Task<IEnumerable<LearnerSkill>> GetAll();

        Task<LearnerSkill?> GetById(int learnerId, int skillId);

        Task<bool> Create(LearnerSkillCreateDto dto);

        Task<bool> Update(int learnerId, int skillId, LearnerSkillUpdateDto dto);

        Task<bool> Delete(int learnerId, int skillId);
    }
}

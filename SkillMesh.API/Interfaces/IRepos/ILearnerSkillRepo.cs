using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IRepos
{
    public interface ILearnerSkillRepo
    {
        Task<IEnumerable<LearnerSkill>> GetAll();

        Task<LearnerSkill?> GetById(int learnerId, int skillId);

        Task<bool> Create(LearnerSkill learnerSkill);

        Task<bool> Update(int learnerId, int skillId, LearnerSkill learnerSkill);

        Task<bool> Delete(int learnerId, int skillId);
    }
}

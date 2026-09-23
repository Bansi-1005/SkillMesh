using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IRepos
{
    public interface ILearnerProfileRepo
    {
        Task<IEnumerable<LearnerProfile>> GetAll();

        Task<LearnerProfile?> GetById(int learnerId);

        Task<bool> Create(LearnerProfile learnerProfile);

        Task<bool> Update(int learnerId, LearnerProfile learnerProfile);

        Task<bool> Delete(int learnerId);
    }
}

using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IRepos
{
    public interface ILearningPathRepo
    {
        Task<IEnumerable<LearningPath>> GetAll();
        Task<LearningPath?> GetById(int id);
        Task<int> Create(LearningPath learningPath);
        Task<bool> Update(int id, LearningPath learningPath);
        Task<bool> Delete(int id);
    }
}

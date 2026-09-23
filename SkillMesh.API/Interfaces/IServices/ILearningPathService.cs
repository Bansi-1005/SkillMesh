using SkillMesh.API.DTOs.LearningPaths;
using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface ILearningPathService
    {
        Task<IEnumerable<LearningPath>> GetAll();
        Task<LearningPath?> GetById(int id);
        Task<int> Create(LearningPathCreateDto dto);
        Task<bool> Update(int id, LearningPathUpdateDto dto);
        Task<bool> Delete(int id);
    }
}

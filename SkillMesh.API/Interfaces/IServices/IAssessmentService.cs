using SkillMesh.API.DTOs.Assessments;
using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface IAssessmentService
    {
        Task<IEnumerable<Assessment>> GetAll();

        Task<Assessment?> GetById(int id);

        Task<int> Create(AssessmentCreateDto dto);

        Task<bool> Update(int id, AssessmentUpdateDto dto);

        Task<bool> Delete(int id);
    }
}

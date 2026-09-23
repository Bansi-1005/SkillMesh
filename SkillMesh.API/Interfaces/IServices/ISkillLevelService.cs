using SkillMesh.API.DTOs.SkillLevels;
using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface ISkillLevelService
    {
        Task<IEnumerable<SkillLevel>> GetAll();

        Task<SkillLevel?> GetById(int id);

        Task<int> Create(SkillLevelCreateDto dto);

        Task<bool> Update(int id, SkillLevelUpdateDto dto);

        Task<bool> Delete(int id);
    }
}

using SkillMesh.API.DTOs.Skills;
using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface ISkillService
    {
        Task<IEnumerable<Skill>> GetAll();

        Task<Skill?> GetById(int id);

        Task<int> Create(SkillCreateDto dto);

        Task<bool> Update(int id, SkillUpdateDto dto);

        Task<bool> Delete(int id);
    }
}

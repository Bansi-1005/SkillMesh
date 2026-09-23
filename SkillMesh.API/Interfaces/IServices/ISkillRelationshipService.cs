using SkillMesh.API.DTOs.SkillRelationships;
using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface ISkillRelationshipService
    {
        Task<IEnumerable<SkillRelationship>> GetAll();

        Task<SkillRelationship?> GetById(int id);

        Task<int> Create(SkillRelationshipCreateDto dto);

        Task<bool> Update(int id, SkillRelationshipUpdateDto dto);

        Task<bool> Delete(int id);
    }
}

using SkillMesh.API.DTOs.Organizations;
using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface IOrganizationService
    {
        Task<IEnumerable<Organization>> GetAll();

        Task<Organization?> GetById(int id);

        Task<int> Create(
            OrganizationCreateDto dto);

        Task<bool> Update(
            int id,
            OrganizationUpdateDto dto);

        Task<bool> Delete(int id);
    }
}

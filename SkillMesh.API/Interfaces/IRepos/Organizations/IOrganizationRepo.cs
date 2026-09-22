using SkillMesh.API.Models.Organizations;

namespace SkillMesh.API.Interfaces.IRepos.Organizations
{
    public interface IOrganizationRepo
    {
        Task<IEnumerable<Organization>> GetAll();

        Task<Organization?> GetById(int id);

        Task<int> Create(Organization organization);

        Task<bool> Update(int id, Organization organization);

        Task<bool> Delete(int id);
    }
}

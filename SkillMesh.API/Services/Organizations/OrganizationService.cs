using SkillMesh.API.DTOs.Organizations;
using SkillMesh.API.Models.Organizations;
using SkillMesh.API.Interfaces.IRepos.Organizations;
using SkillMesh.API.Interfaces.IServices.Organizations;

namespace SkillMesh.API.Services.Organizations
{
    public class OrganizationService : IOrganizationService
    {
        private readonly IOrganizationRepo _repository;

        public OrganizationService(IOrganizationRepo repository)
        {
            _repository = repository;
        }


        // GET ALL
        public async Task<IEnumerable<Organization>> GetAll()
        {
            return await _repository.GetAll();
        }


        // GET BY ID
        public async Task<Organization?> GetById(int id)
        {
            return await _repository.GetById(id);
        }


        // CREATE
        public async Task<int> Create(OrganizationCreateDto dto)
        {
            Organization organization = new Organization
            {
                OrganizationName = dto.OrganizationName,
                OrganizationCode = dto.OrganizationCode,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                City = dto.City,
                State = dto.State,
                Country = dto.Country,
                IsActive = true
            };

            return await _repository.Create(organization);
        }


        // UPDATE
        public async Task<bool> Update(int id, OrganizationUpdateDto dto)
        {
            Organization organization = new Organization
            {
                OrganizationName = dto.OrganizationName,
                OrganizationCode = dto.OrganizationCode,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                City = dto.City,
                State = dto.State,
                Country = dto.Country,
                IsActive = dto.IsActive
            };

            return await _repository.Update(
                id,
                organization
            );
        }


        // DELETE
        public async Task<bool> Delete(int id)
        {
            return await _repository.Delete(id);
        }
    }
}

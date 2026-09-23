using SkillMesh.API.DTOs.SkillRelationships;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Models;

namespace SkillMesh.API.Services
{
    public class SkillRelationshipService : ISkillRelationshipService
    {
        private readonly ISkillRelationshipRepo _skillRelationshipRepo;

        public SkillRelationshipService(
            ISkillRelationshipRepo skillRelationshipRepo)
        {
            _skillRelationshipRepo = skillRelationshipRepo;
        }

        public async Task<IEnumerable<SkillRelationship>> GetAll()
        {
            try
            {
                return await _skillRelationshipRepo.GetAll();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<SkillRelationship?> GetById(int id)
        {
            try
            {
                return await _skillRelationshipRepo.GetById(id);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<int> Create(
            SkillRelationshipCreateDto dto)
        {
            try
            {
                SkillRelationship skillRelationship = new SkillRelationship
                {
                    SkillId = dto.SkillId,
                    RelatedSkillId = dto.RelatedSkillId,
                    RelationshipType = dto.RelationshipType
                };

                return await _skillRelationshipRepo.Create(
                    skillRelationship
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(
            int id,
            SkillRelationshipUpdateDto dto)
        {
            try
            {
                SkillRelationship skillRelationship = new SkillRelationship
                {
                    SkillId = dto.SkillId,
                    RelatedSkillId = dto.RelatedSkillId,
                    RelationshipType = dto.RelationshipType
                };

                return await _skillRelationshipRepo.Update(
                    id,
                    skillRelationship
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Delete(int id)
        {
            try
            {
                return await _skillRelationshipRepo.Delete(id);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

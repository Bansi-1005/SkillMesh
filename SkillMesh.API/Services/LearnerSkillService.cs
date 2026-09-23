using SkillMesh.API.DTOs.LearnerSkills;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Models;

namespace SkillMesh.API.Services
{
    public class LearnerSkillService : ILearnerSkillService
    {
        private readonly ILearnerSkillRepo _learnerSkillRepo;

        public LearnerSkillService(ILearnerSkillRepo learnerSkillRepo)
        {
            _learnerSkillRepo = learnerSkillRepo;
        }

        // GET ALL
        public async Task<IEnumerable<LearnerSkill>> GetAll()
        {
            try
            {
                return await _learnerSkillRepo.GetAll();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BY ID
        public async Task<LearnerSkill?> GetById(
            int learnerId,
            int skillId)
        {
            try
            {
                return await _learnerSkillRepo.GetById(
                    learnerId,
                    skillId);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE
        public async Task<bool> Create(LearnerSkillCreateDto dto)
        {
            try
            {
                LearnerSkill learnerSkill = new LearnerSkill
                {
                    LearnerId = dto.LearnerId,
                    SkillId = dto.SkillId,
                    CurrentSkillLevelId = dto.CurrentSkillLevelId,
                    LastAssessedAt = dto.LastAssessedAt
                };

                return await _learnerSkillRepo.Create(learnerSkill);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(
            int learnerId,
            int skillId,
            LearnerSkillUpdateDto dto)
        {
            try
            {
                LearnerSkill learnerSkill = new LearnerSkill
                {
                    CurrentSkillLevelId = dto.CurrentSkillLevelId,
                    LastAssessedAt = dto.LastAssessedAt
                };

                return await _learnerSkillRepo.Update(
                    learnerId,
                    skillId,
                    learnerSkill);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // DELETE
        public async Task<bool> Delete(
            int learnerId,
            int skillId)
        {
            try
            {
                return await _learnerSkillRepo.Delete(
                    learnerId,
                    skillId);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

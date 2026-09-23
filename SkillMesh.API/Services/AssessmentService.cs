using SkillMesh.API.DTOs.Assessments;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Models;

namespace SkillMesh.API.Services
{
    public class AssessmentService : IAssessmentService
    {
        private readonly IAssessmentRepo _assessmentRepo;

        public AssessmentService(IAssessmentRepo assessmentRepo)
        {
            _assessmentRepo = assessmentRepo;
        }

        // GET ALL
        public async Task<IEnumerable<Assessment>> GetAll()
        {
            try
            {
                return await _assessmentRepo.GetAll();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BY ID
        public async Task<Assessment?> GetById(int id)
        {
            try
            {
                return await _assessmentRepo.GetById(id);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE
        public async Task<int> Create(AssessmentCreateDto dto)
        {
            try
            {
                Assessment assessment = new Assessment
                {
                    AssessmentName = dto.AssessmentName,
                    Description = dto.Description,
                    AssessmentType = dto.AssessmentType,
                    DurationMinutes = dto.DurationMinutes,
                    PassingPercentage = dto.PassingPercentage,
                    IsActive = true
                };

                return await _assessmentRepo.Create(assessment);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(
            int id,
            AssessmentUpdateDto dto)
        {
            try
            {
                Assessment assessment = new Assessment
                {
                    AssessmentName = dto.AssessmentName,
                    Description = dto.Description,
                    AssessmentType = dto.AssessmentType,
                    DurationMinutes = dto.DurationMinutes,
                    PassingPercentage = dto.PassingPercentage,
                    IsActive = dto.IsActive
                };

                return await _assessmentRepo.Update(
                    id,
                    assessment);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // DELETE
        public async Task<bool> Delete(int id)
        {
            try
            {
                return await _assessmentRepo.Delete(id);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

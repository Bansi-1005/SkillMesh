using SkillMesh.API.DTOs.LearnerProfiles;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Models;

namespace SkillMesh.API.Services
{
    public class LearnerProfileService : ILearnerProfileService
    {
        private readonly ILearnerProfileRepo _learnerProfileRepo;

        public LearnerProfileService(
            ILearnerProfileRepo learnerProfileRepo)
        {
            _learnerProfileRepo = learnerProfileRepo;
        }

        // GET ALL
        public async Task<IEnumerable<LearnerProfile>> GetAll()
        {
            try
            {
                return await _learnerProfileRepo.GetAll();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BY ID
        public async Task<LearnerProfile?> GetById(
            int learnerId)
        {
            try
            {
                return await _learnerProfileRepo.GetById(
                    learnerId);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE
        public async Task<bool> Create(
            LearnerProfileCreateDto dto)
        {
            try
            {
                LearnerProfile learnerProfile =
                    new LearnerProfile
                    {
                        LearnerId = dto.LearnerId,
                        DateOfBirth = dto.DateOfBirth,
                        Bio = dto.Bio,
                        ProfilePhotoUrl =
                            dto.ProfilePhotoUrl
                    };

                return await _learnerProfileRepo.Create(
                    learnerProfile);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE
        public async Task<bool> Update(
            int learnerId,
            LearnerProfileUpdateDto dto)
        {
            try
            {
                LearnerProfile learnerProfile =
                    new LearnerProfile
                    {
                        DateOfBirth = dto.DateOfBirth,
                        Bio = dto.Bio,
                        ProfilePhotoUrl =
                            dto.ProfilePhotoUrl
                    };

                return await _learnerProfileRepo.Update(
                    learnerId,
                    learnerProfile);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // DELETE
        public async Task<bool> Delete(
            int learnerId)
        {
            try
            {
                return await _learnerProfileRepo.Delete(
                    learnerId);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

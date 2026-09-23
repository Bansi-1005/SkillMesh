using SkillMesh.API.DTOs.Courses;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Models;

namespace SkillMesh.API.Services
{
    public class CourseService : ICourseService
    {
        private readonly ICourseRepo _courseRepo;

        public CourseService(ICourseRepo courseRepo)
        {
            _courseRepo = courseRepo;
        }

        public async Task<IEnumerable<Course>> GetAll()
        {
            try
            {
                return await _courseRepo.GetAll();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<Course?> GetById(int id)
        {
            try
            {
                return await _courseRepo.GetById(id);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<int> Create(CourseCreateDto dto)
        {
            try
            {
                Course course = new Course
                {
                    CreatedByUserId = dto.CreatedByUserId,
                    CourseName = dto.CourseName,
                    Description = dto.Description,
                    Difficulty = dto.Difficulty,
                    DurationHours = dto.DurationHours,
                    IsPublished = false
                };

                return await _courseRepo.Create(course);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(int id, CourseUpdateDto dto)
        {
            try
            {
                Course course = new Course
                {
                    CourseName = dto.CourseName,
                    Description = dto.Description,
                    Difficulty = dto.Difficulty,
                    DurationHours = dto.DurationHours,
                    IsPublished = dto.IsPublished
                };

                return await _courseRepo.Update(id, course);
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
                return await _courseRepo.Delete(id);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

using SkillMesh.API.DTOs.Courses;
using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface ICourseService
    {
        Task<IEnumerable<Course>> GetAll();
        Task<Course?> GetById(int id);
        Task<int> Create(CourseCreateDto dto);
        Task<bool> Update(int id, CourseUpdateDto dto);
        Task<bool> Delete(int id);
    }
}

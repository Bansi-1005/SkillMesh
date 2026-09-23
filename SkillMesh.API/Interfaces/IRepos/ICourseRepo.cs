using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IRepos
{
    public interface ICourseRepo
    {
        Task<IEnumerable<Course>> GetAll();
        Task<Course?> GetById(int id);
        Task<int> Create(Course course);
        Task<bool> Update(int id, Course course);
        Task<bool> Delete(int id);
    }
}

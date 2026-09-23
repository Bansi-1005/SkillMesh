using SkillMesh.API.DTOs.Projects;
using SkillMesh.API.Models;

namespace SkillMesh.API.Interfaces.IServices
{
    public interface IProjectService
    {
        Task<IEnumerable<Project>> GetAll();
        Task<Project?> GetById(int id);
        Task<int> Create(ProjectCreateDto dto);
        Task<bool> Update(int id, ProjectUpdateDto dto);
        Task<bool> Delete(int id);
    }
}

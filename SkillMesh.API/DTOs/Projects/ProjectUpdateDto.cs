namespace SkillMesh.API.DTOs.Projects
{
    public class ProjectUpdateDto
    {
        public string ProjectName { get; set; }
        public string? Description { get; set; }
        public string Difficulty { get; set; }
        public bool IsActive { get; set; }
    }
}

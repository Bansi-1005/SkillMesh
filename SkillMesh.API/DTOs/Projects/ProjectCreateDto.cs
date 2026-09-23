namespace SkillMesh.API.DTOs.Projects
{
    public class ProjectCreateDto
    {
        public int CreatedByUserId { get; set; }
        public string ProjectName { get; set; }
        public string? Description { get; set; }
        public string Difficulty { get; set; }
    }
}

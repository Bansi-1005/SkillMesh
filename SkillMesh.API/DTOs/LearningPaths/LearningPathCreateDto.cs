namespace SkillMesh.API.DTOs.LearningPaths
{
    public class LearningPathCreateDto
    {
        public int JobRoleId { get; set; }
        public string PathName { get; set; }
        public string? Description { get; set; }
    }
}

namespace SkillMesh.API.DTOs.LearningPaths
{
    public class LearningPathUpdateDto
    {
        public int JobRoleId { get; set; }
        public string PathName { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }
}

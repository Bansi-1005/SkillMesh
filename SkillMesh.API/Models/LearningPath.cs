namespace SkillMesh.API.Models
{
    public class LearningPath
    {
        public int LearningPathId { get; set; }
        public int JobRoleId { get; set; }
        public string PathName { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

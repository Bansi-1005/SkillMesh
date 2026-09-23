namespace SkillMesh.API.Models
{
    public class Project
    {
        public int ProjectId { get; set; }
        public int CreatedByUserId { get; set; }
        public string ProjectName { get; set; }
        public string? Description { get; set; }
        public string Difficulty { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

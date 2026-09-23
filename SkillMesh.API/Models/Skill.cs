namespace SkillMesh.API.Models
{
    public class Skill
    {
        public int SkillId { get; set; }
        public int SkillCategoryId { get; set; }
        public string SkillName { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

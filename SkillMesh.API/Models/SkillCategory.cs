namespace SkillMesh.API.Models
{
    public class SkillCategory
    {
        public int SkillCategoryId { get; set; }

        public string CategoryName { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}

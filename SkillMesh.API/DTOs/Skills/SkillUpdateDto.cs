namespace SkillMesh.API.DTOs.Skills
{
    public class SkillUpdateDto
    {
        public int SkillCategoryId { get; set; }
        public string SkillName { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }
}

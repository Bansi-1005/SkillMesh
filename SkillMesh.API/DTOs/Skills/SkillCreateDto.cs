namespace SkillMesh.API.DTOs.Skills
{
    public class SkillCreateDto
    {
        public int SkillCategoryId { get; set; }
        public string SkillName { get; set; }
        public string? Description { get; set; }
    }
}

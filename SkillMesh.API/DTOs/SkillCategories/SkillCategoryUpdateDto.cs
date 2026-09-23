namespace SkillMesh.API.DTOs.SkillCategories
{
    public class SkillCategoryUpdateDto
    {
        public string CategoryName { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; }
    }
}

namespace SkillMesh.API.DTOs.SkillRelationships
{
    public class SkillRelationshipCreateDto
    {
        public int SkillId { get; set; }

        public int RelatedSkillId { get; set; }

        public string RelationshipType { get; set; }
    }
}

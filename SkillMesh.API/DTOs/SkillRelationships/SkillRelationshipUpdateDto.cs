namespace SkillMesh.API.DTOs.SkillRelationships
{
    public class SkillRelationshipUpdateDto
    {
        public int SkillId { get; set; }

        public int RelatedSkillId { get; set; }

        public string RelationshipType { get; set; }
    }
}

namespace SkillMesh.API.Models
{
    public class SkillRelationship
    {
        public int SkillRelationshipId { get; set; }

        public int SkillId { get; set; }

        public int RelatedSkillId { get; set; }

        public string RelationshipType { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}

namespace SkillMesh.API.Models
{
    public class LearnerSkill
    {
        public int LearnerId { get; set; }

        public int SkillId { get; set; }

        public int CurrentSkillLevelId { get; set; }

        public DateTime? LastAssessedAt { get; set; }
    }
}

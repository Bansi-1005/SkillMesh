namespace SkillMesh.API.DTOs.LearnerSkills
{
    public class LearnerSkillCreateDto
    {
        public int LearnerId { get; set; }

        public int SkillId { get; set; }

        public int CurrentSkillLevelId { get; set; }

        public DateTime? LastAssessedAt { get; set; }
    }
}

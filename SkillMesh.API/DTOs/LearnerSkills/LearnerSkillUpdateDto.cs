namespace SkillMesh.API.DTOs.LearnerSkills
{
    public class LearnerSkillUpdateDto
    {
        public int CurrentSkillLevelId { get; set; }

        public DateTime? LastAssessedAt { get; set; }
    }
}

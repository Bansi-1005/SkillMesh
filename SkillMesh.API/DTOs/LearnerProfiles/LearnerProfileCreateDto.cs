namespace SkillMesh.API.DTOs.LearnerProfiles
{
    public class LearnerProfileCreateDto
    {
        public int LearnerId { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string? Bio { get; set; }

        public string? ProfilePhotoUrl { get; set; }
    }
}

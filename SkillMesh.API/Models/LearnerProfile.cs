namespace SkillMesh.API.Models
{
    public class LearnerProfile
    {
        public int LearnerId { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string? Bio { get; set; }

        public string? ProfilePhotoUrl { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}

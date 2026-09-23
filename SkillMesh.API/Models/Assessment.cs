namespace SkillMesh.API.Models
{
    public class Assessment
    {
        public int AssessmentId { get; set; }

        public string AssessmentName { get; set; }

        public string? Description { get; set; }

        public string AssessmentType { get; set; }

        public int? DurationMinutes { get; set; }

        public decimal? PassingPercentage { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}

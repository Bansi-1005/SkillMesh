namespace SkillMesh.API.DTOs.Assessments
{
    public class AssessmentCreateDto
    {
        public string AssessmentName { get; set; }

        public string? Description { get; set; }

        public string AssessmentType { get; set; }

        public int? DurationMinutes { get; set; }

        public decimal? PassingPercentage { get; set; }
    }
}

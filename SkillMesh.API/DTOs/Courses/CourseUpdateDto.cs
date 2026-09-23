namespace SkillMesh.API.DTOs.Courses
{
    public class CourseUpdateDto
    {
        public string CourseName { get; set; }
        public string? Description { get; set; }
        public string Difficulty { get; set; }
        public decimal? DurationHours { get; set; }
        public bool IsPublished { get; set; }
    }
}

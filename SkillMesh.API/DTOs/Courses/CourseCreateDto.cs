namespace SkillMesh.API.DTOs.Courses
{
    public class CourseCreateDto
    {
        public int CreatedByUserId { get; set; }
        public string CourseName { get; set; }
        public string? Description { get; set; }
        public string Difficulty { get; set; }
        public decimal? DurationHours { get; set; }
    }
}

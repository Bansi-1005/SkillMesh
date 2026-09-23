namespace SkillMesh.API.Models
{
    public class Course
    {
        public int CourseId { get; set; }
        public int CreatedByUserId { get; set; }
        public string CourseName { get; set; }
        public string? Description { get; set; }
        public string Difficulty { get; set; }
        public decimal? DurationHours { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

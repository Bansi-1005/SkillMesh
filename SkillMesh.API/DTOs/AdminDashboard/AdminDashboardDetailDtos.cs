
namespace SkillMesh.API.DTOs.AdminDashboard
{
    public class AdminDashboardDetailDtos
    {
        public int LearnerId { get; set; }

        public int UserId { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public DateTime? DateOfBirth { get; set; }

        public string? Bio { get; set; }

        public bool IsActive { get; set; }

        public DateTime? CreatedAt { get; set; }
    }
}

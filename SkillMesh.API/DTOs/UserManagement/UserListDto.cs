
namespace SkillMesh.API.DTOs.UserManagement
{
    public class UserListDto
    {
        public int UserId { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public int? OrganizationId { get; set; }

        public string? OrganizationName { get; set; }

        public int RoleId { get; set; }

        public string RoleName { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}

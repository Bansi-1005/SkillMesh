
namespace SkillMesh.API.DTOs.UserManagement
{
    public class LearnerManagementDto
    {
        public int UserId { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public int? OrganizationId { get; set; }

        public string? OrganizationName { get; set; }

        public bool IsActive { get; set; }

        public bool AdminIsActive { get; set; }

        //public bool OrganizationIsActive { get; set; }

        public DateTime CreatedAt { get; set; }

        //public bool EffectiveIsActive =>
        //    IsActive &&
        //    AdminIsActive &&
        //    OrganizationIsActive;
    }
}

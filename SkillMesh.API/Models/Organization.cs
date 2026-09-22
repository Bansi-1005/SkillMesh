namespace SkillMesh.API.Models
{
    public class Organization
    {
        public int OrganizationId { get; set; }

        public string OrganizationName { get; set; }

        public string OrganizationCode { get; set; }

        public string? Email { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string? City { get; set; }

        public string? State { get; set; }

        public string? Country { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}

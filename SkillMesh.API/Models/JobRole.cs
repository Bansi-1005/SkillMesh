namespace SkillMesh.API.Models
{
    public class JobRole
    {
        public int JobRoleId { get; set; }

        public string JobRoleName { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}

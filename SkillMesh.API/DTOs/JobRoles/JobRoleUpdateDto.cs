namespace SkillMesh.API.DTOs.JobRoles
{
    public class JobRoleUpdateDto
    {
        public string JobRoleName { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; }
    }
}

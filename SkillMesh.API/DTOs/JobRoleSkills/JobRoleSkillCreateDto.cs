namespace SkillMesh.API.DTOs.JobRoleSkills
{
    public class JobRoleSkillCreateDto
    {
        public int JobRoleId { get; set; }

        public int SkillId { get; set; }

        public int RequiredSkillLevelId { get; set; }

        public bool IsMandatory { get; set; }
    }
}

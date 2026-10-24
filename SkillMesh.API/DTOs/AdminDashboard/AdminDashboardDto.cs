using System.Collections.Generic;

namespace SkillMesh.API.DTOs.AdminDashboard
{
    public class AdminDashboardDto
    {
        public int TotalLearners { get; set; }

        public int AvailableSkills { get; set; }

        public int PublishedCourses { get; set; }

        public int ActiveAssessments { get; set; }

        // Kept for compatibility with existing frontend code.
        public int? OrganizationId { get; set; }

        public string OrganizationName { get; set; } = string.Empty;

        public int OrganizationCount { get; set; }

        // All organizations assigned to the logged-in Admin.
        //public List<AdminOrganizationDto> Organizations { get; set; }
        //    = new List<AdminOrganizationDto>();

        public List<AdminDashboardDetailDtos> Learners { get; set; }
            = new List<AdminDashboardDetailDtos>();
    }
}
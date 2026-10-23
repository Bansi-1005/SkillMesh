
namespace SkillMesh.API.DTOs.SuperAdminDashboard
{
    public class SuperAdminDashboardDto
    {
        public int TotalOrganizations { get; set; }
        public int ActiveOrganizations { get; set; }

        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int NewUsersThisMonth { get; set; }

        public int TotalAdmins { get; set; }

        public int TotalSkills { get; set; }

        public int TotalCourses { get; set; }
        public int PublishedCourses { get; set; }

        public int ActiveOrganizationsPercentage { get; set; }
        public int ActiveUsersPercentage { get; set; }
        public int PublishedCoursesPercentage { get; set; }

        public List<DashboardOrganizationDto> RecentOrganizations
        {
            get;
            set;
        } = new List<DashboardOrganizationDto>();

        public List<MonthlyUserRegistrationDto> MonthlyUserRegistrations
        {
            get;
            set;
        } = new List<MonthlyUserRegistrationDto>();



    }

    public class DashboardOrganizationDto
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int Users { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class MonthlyUserRegistrationDto
    {
        public string Month { get; set; } = string.Empty;
        public int Users { get; set; }
    }

}



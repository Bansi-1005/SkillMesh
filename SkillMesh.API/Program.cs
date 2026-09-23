using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Repositories;
using SkillMesh.API.Services;
using SkillMesh.API.Helpers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddScoped<DbConnectionFactory>();

// Organization
builder.Services.AddScoped<IOrganizationRepo, OrganizationRepo>();
builder.Services.AddScoped<IOrganizationService, OrganizationService>();

// Skill Category
builder.Services.AddScoped<ISkillCategoryRepo, SkillCategoryRepo>();
builder.Services.AddScoped<ISkillCategoryService, SkillCategoryService>();

// Skill
builder.Services.AddScoped<ISkillRepo, SkillRepo>();
builder.Services.AddScoped<ISkillService, SkillService>();

// Skill Level
builder.Services.AddScoped<ISkillLevelRepo, SkillLevelRepo>();
builder.Services.AddScoped<ISkillLevelService, SkillLevelService>();

// Skill Relationship
builder.Services.AddScoped<ISkillRelationshipRepo, SkillRelationshipRepo>();
builder.Services.AddScoped<ISkillRelationshipService, SkillRelationshipService>();

// Job Role
builder.Services.AddScoped<IJobRoleRepo, JobRoleRepo>();
builder.Services.AddScoped<IJobRoleService, JobRoleService>();

// Job Role Skill
builder.Services.AddScoped<IJobRoleSkillRepo, JobRoleSkillRepo>();
builder.Services.AddScoped<IJobRoleSkillService, JobRoleSkillService>();

// Learner Profile
builder.Services.AddScoped<ILearnerProfileRepo, LearnerProfileRepo>();
builder.Services.AddScoped<ILearnerProfileService, LearnerProfileService>();

builder.Services.AddScoped<ILearnerSkillRepo, LearnerSkillRepo>();
builder.Services.AddScoped<ILearnerSkillService, LearnerSkillService>();

// Assessment
builder.Services.AddScoped<IAssessmentRepo, AssessmentRepo>();
builder.Services.AddScoped<IAssessmentService, AssessmentService>();

// Course
builder.Services.AddScoped<ICourseRepo, CourseRepo>();
builder.Services.AddScoped<ICourseService, CourseService>();

// Learning Path
builder.Services.AddScoped<ILearningPathRepo, LearningPathRepo>();
builder.Services.AddScoped<ILearningPathService, LearningPathService>();

// Project
builder.Services.AddScoped<IProjectRepo, ProjectRepo>();
builder.Services.AddScoped<IProjectService, ProjectService>();


builder.Services.AddScoped<IAuthRepo, AuthRepo>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<JwtHelper>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

// =====================================================
// SWAGGER
// =====================================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description = "Enter your JWT token."
        });

    options.AddSecurityRequirement(
        new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference =
                        new Microsoft.OpenApi.Models.OpenApiReference
                        {
                            Type =
                                Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                },
                Array.Empty<string>()
            }
        });
});


// =====================================================
// JWT SETTINGS
// =====================================================
var jwtSettings =
    builder.Configuration.GetSection("Jwt");

var jwtKey =
    jwtSettings["Key"];


// =====================================================
// AUTHENTICATION
// =====================================================

builder.Services.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,

                ValidateAudience = true,

                ValidateLifetime = true,

                ValidateIssuerSigningKey = true,

                ValidIssuer =
                    jwtSettings["Issuer"],

                ValidAudience =
                    jwtSettings["Audience"],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            jwtKey!
                        )
                    ),
                RoleClaimType =
                    ClaimTypes.Role,

                ClockSkew =
                    TimeSpan.Zero
            };
    });

// =====================================================
// AUTHORIZATION
// =====================================================

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();

using SkillMesh.API.Data;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Repositories;
using SkillMesh.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddScoped<DbConnectionFactory>();

builder.Services.AddScoped<IOrganizationRepo, OrganizationRepo>(); 
builder.Services.AddScoped<IOrganizationService, OrganizationService>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

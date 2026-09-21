using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.Data;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatabaseTestController : ControllerBase
    {
        private readonly DbConnectionFactory _connectionFactory;

        public DatabaseTestController(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        [HttpGet]
        public IActionResult TestConnection()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();

                connection.Open();

                return Ok("Database connected successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Database connection failed: " + ex.Message);
            }
        }
    }
}

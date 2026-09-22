using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.Organizations;
using SkillMesh.API.Services;
using SkillMesh.API.Interfaces.IServices;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrganizationController : ControllerBase
    {
        private readonly IOrganizationService _service;

        public OrganizationController(
            IOrganizationService service)
        {
            _service = service;
        }


        // GET: api/Organizations
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var organizations =
                await _service.GetAll();

            return Ok(organizations);
        }


        // GET: api/Organizations/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var organization =
                await _service.GetById(id);

            if (organization == null)
            {
                return NotFound(
                    "Organization not found."
                );
            }

            return Ok(organization);
        }


        // POST: api/Organizations
        [HttpPost]
        public async Task<IActionResult> Create(
            OrganizationCreateDto dto)
        {
            int id =
                await _service.Create(dto);

            return Ok(new
            {
                Message =
                    "Organization created successfully.",

                OrganizationId = id
            });
        }


        // PUT: api/Organizations/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            OrganizationUpdateDto dto)
        {
            bool result =
                await _service.Update(id, dto);

            if (!result)
            {
                return NotFound(
                    "Organization not found."
                );
            }

            return Ok(
                "Organization updated successfully."
            );
        }


        // DELETE: api/Organizations/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            bool result =
                await _service.Delete(id);

            if (!result)
            {
                return NotFound(
                    "Organization not found."
                );
            }

            return Ok(
                "Organization deleted successfully."
            );
        }
    }
}

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.Organizations;
using SkillMesh.API.Services;
using SkillMesh.API.Interfaces.IServices;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrganizationController : ControllerBase
    {
        private readonly IOrganizationService _service;

        public OrganizationController(IOrganizationService service)
        {
            _service = service;
        }

        // GET ALL

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                if (IsSuperAdmin())
                {
                    var organizations = await _service.GetAll();
                    return Ok(organizations);
                }

                if (IsAdmin())
                {
                    var organizationId = GetAssignedOrganizationId();

                    if (organizationId == null)
                        return Forbid();

                    var organization = await _service.GetById(organizationId.Value);

                    if (organization == null)
                        return NotFound("Assigned organization not found.");

                    // Return an array to keep your current frontend compatible.
                    return Ok(new[] { organization });
                }

                return Forbid();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while getting organizations.",
                    Error = ex.Message
                });
            }
        }


        //[HttpGet]
        //public async Task<IActionResult> GetAll()
        //{
        //    try
        //    {
        //        var organizations = await _service.GetAll();

        //        return Ok(organizations);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new
        //        {
        //            Message = "Error while getting organizations.",
        //            Error = ex.Message
        //        });
        //    }
        //}

        // GET BY ID

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                if (IsAdmin() && !IsSuperAdmin())
                {
                    var assignedId = GetAssignedOrganizationId();

                    if (assignedId == null)
                        return Forbid();

                    if (id != assignedId.Value)
                        return Forbid();
                }
                else if (!IsSuperAdmin())
                {
                    return Forbid();
                }

                var organization = await _service.GetById(id);

                if (organization == null)
                    return NotFound("Organization not found.");

                return Ok(organization);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while getting organization.",
                    Error = ex.Message
                });
            }
        }


        //[HttpGet("{id}")]
        //public async Task<IActionResult> GetById(int id)
        //{
        //    try
        //    {
        //        var organization = await _service.GetById(id);

        //        if (organization == null)
        //        {
        //            return NotFound("Organization not found.");
        //        }

        //        return Ok(organization);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new
        //        {
        //            Message = "Error while getting organization.",
        //            Error = ex.Message
        //        });
        //    }
        //}

        // CREATE
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create(
            OrganizationCreateDto dto)
        {
            try
            {
                if (!IsSuperAdmin())
                    return Forbid();

                int id = await _service.Create(dto);

                return Ok(new
                {
                    Message = "Organization created successfully.",
                    OrganizationId = id
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while creating organization.",
                    Error = ex.Message
                });
            }
        }

        // UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            OrganizationUpdateDto dto)
        {
            try
            {
                if (IsAdmin() && !IsSuperAdmin())
                {
                    var assignedId = GetAssignedOrganizationId();

                    if (assignedId == null)
                        return Forbid();

                    if (id != assignedId.Value)
                        return Forbid();
                }
                else if (!IsSuperAdmin())
                {
                    return Forbid();
                }

                bool result = await _service.Update(id, dto);

                if (!result)
                {
                    return NotFound("Organization not found.");
                }

                return Ok("Organization updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while updating organization.",
                    Error = ex.Message
                });
            }
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                if (!IsSuperAdmin())
                    return Forbid();

                bool result = await _service.Delete(id);

                if (!result)
                {
                    return NotFound("Organization not found.");
                }

                return Ok("Organization deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while deleting organization.",
                    Error = ex.Message
                });
            }
        }

        private bool IsSuperAdmin()
        {
            return User.IsInRole("Super Admin")
                || User.IsInRole("SuperAdmin");
        }

        private bool IsAdmin()
        {
            return User.IsInRole("Admin");
        }

        private int? GetAssignedOrganizationId()
        {
            var claim = User.FindFirst("OrganizationId")
                ?? User.FindFirst("organizationId");

            if (claim != null &&
                int.TryParse(claim.Value, out int organizationId))
            {
                return organizationId;
            }

            return null;
        }
    }
}

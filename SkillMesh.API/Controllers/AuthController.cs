using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMesh.API.DTOs.Authentication;
using SkillMesh.API.Helpers;
using SkillMesh.API.Interfaces.IServices;
using System.Security.Claims;

namespace SkillMesh.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _service;

        public AuthController(
            IAuthService service)
        {
            _service = service;
        }


        // =====================================================
        // LEARNER SELF REGISTRATION
        // =====================================================

        // POST:
        // api/Auth/register/learner

        [AllowAnonymous]
        [HttpPost("register/learner")]
        public async Task<IActionResult> RegisterLearner(
            RegisterDto dto)
        {
            try
            {
                int userId =
                    await _service.RegisterLearner(dto);

                return Ok(new
                {
                    Message =
                        "Learner registered successfully.",

                    UserId = userId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }


        // =====================================================
        // ADMIN REGISTRATION
        // ONLY SUPER ADMIN
        // =====================================================

        // POST:
        // api/Auth/register/admin

        [Authorize(Roles = RoleNames.SuperAdmin)]
        [HttpPost("register/admin")]
        public async Task<IActionResult> RegisterAdmin(
            RegisterDto dto)
        {
            try
            {
                int userId =
                    await _service.RegisterAdmin(dto);

                return Ok(new
                {
                    Message =
                        "Admin registered successfully.",

                    UserId = userId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }


        // =====================================================
        // ORGANIZATION LEARNER REGISTRATION
        //
        // ADMIN:
        // Uses own OrganizationId from JWT
        //
        // SUPER ADMIN:
        // Uses OrganizationId from DTO
        // =====================================================

        // POST:
        // api/Auth/register/organization-learner

        [Authorize(
            Roles =
                RoleNames.SuperAdmin + "," +
                RoleNames.Admin)]
        [HttpPost("register/organization-learner")]
        public async Task<IActionResult>
            RegisterOrganizationLearner(
                RegisterDto dto)
        {
            try
            {
                int organizationId;


                // ---------------------------------------------
                // ADMIN
                // ---------------------------------------------

                if (User.IsInRole(RoleNames.Admin))
                {
                    string? organizationIdClaim =
                        User.FindFirst(
                            "OrganizationId"
                        )?.Value;

                    if (string.IsNullOrEmpty(
                        organizationIdClaim))
                    {
                        return BadRequest(new
                        {
                            Message =
                                "Organization information is missing from the token."
                        });
                    }

                    if (!int.TryParse(
                        organizationIdClaim,
                        out organizationId))
                    {
                        return BadRequest(new
                        {
                            Message =
                                "Invalid organization information."
                        });
                    }
                }

                // ---------------------------------------------
                // SUPER ADMIN
                // ---------------------------------------------

                else
                {
                    if (!dto.OrganizationId.HasValue)
                    {
                        return BadRequest(new
                        {
                            Message =
                                "OrganizationId is required for Super Admin."
                        });
                    }

                    organizationId =
                        dto.OrganizationId.Value;
                }


                // ---------------------------------------------
                // CREATE LEARNER
                // ---------------------------------------------

                int userId =
                    await _service
                        .RegisterOrganizationLearner(
                            dto,
                            organizationId
                        );


                return Ok(new
                {
                    Message =
                        "Organization learner registered successfully.",

                    UserId = userId,

                    OrganizationId =
                        organizationId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }


        // =====================================================
        // LOGIN
        // ALL THREE ROLES
        // =====================================================

        // POST:
        // api/Auth/login

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(
            LoginDto dto)
        {
            var result =
                await _service.Login(dto);

            if (result == null)
            {
                return Unauthorized(new
                {
                    Message =
                        "Invalid email or password."
                });
            }

            return Ok(result);
        }
    }
}
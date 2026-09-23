using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SkillMesh.API.Helpers
{
    public class JwtHelper
    {
        private readonly IConfiguration _configuration;

        public JwtHelper(
            IConfiguration configuration)
        {
            _configuration = configuration;
        }


        public string GenerateToken(
            int userId,
            string email,
            string role,
            int? organizationId)
        {
            var jwtSettings =
                _configuration.GetSection("Jwt");


            string key =
                jwtSettings["Key"]!;

            string issuer =
                jwtSettings["Issuer"]!;

            string audience =
                jwtSettings["Audience"]!;

            double expiryMinutes =
                Convert.ToDouble(
                    jwtSettings["ExpiryMinutes"]
                );


            var claims =
                new List<Claim>
                {
                    new Claim(
                        ClaimTypes.NameIdentifier,
                        userId.ToString()
                    ),

                    new Claim(
                        ClaimTypes.Email,
                        email
                    ),

                    new Claim(
                        ClaimTypes.Role,
                        role
                    )
                };


            // ---------------------------------------------
            // OrganizationId
            // ---------------------------------------------

            if (organizationId.HasValue)
            {
                claims.Add(
                    new Claim(
                        "OrganizationId",
                        organizationId.Value.ToString()
                    )
                );
            }


            var securityKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(key)
                );


            var credentials =
                new SigningCredentials(
                    securityKey,
                    SecurityAlgorithms.HmacSha256
                );


            var token =
                new JwtSecurityToken(
                    issuer: issuer,

                    audience: audience,

                    claims: claims,

                    expires:
                        DateTime.UtcNow.AddMinutes(
                            expiryMinutes
                        ),

                    signingCredentials:
                        credentials
                );


            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}
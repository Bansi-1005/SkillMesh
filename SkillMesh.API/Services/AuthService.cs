using SkillMesh.API.DTOs.Authentication;
using SkillMesh.API.Helpers;
using SkillMesh.API.Interfaces.IRepos;
using SkillMesh.API.Interfaces.IServices;
using SkillMesh.API.Models;

namespace SkillMesh.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepo _repository;

        private readonly JwtHelper _jwtHelper;

        public AuthService(
            IAuthRepo repository,
            JwtHelper jwtHelper)
        {
            _repository = repository;

            _jwtHelper = jwtHelper;
        }


        // =====================================================
        // LEARNER SELF REGISTRATION
        // =====================================================

        public async Task<int> RegisterLearner(RegisterDto dto)
        {
            // -----------------------------------------
            // 1. Normalize email
            // -----------------------------------------

            string email = dto.Email.Trim().ToLower();


            // -----------------------------------------
            // 2. Check duplicate email
            // -----------------------------------------

            bool emailExists =
                await _repository.EmailExists(email);

            if (emailExists)
            {
                throw new Exception(
                    "Email already registered."
                );
            }


            // -----------------------------------------
            // 3. Get Learner Role
            // -----------------------------------------

            int? learnerRoleId =
                await _repository.GetRoleIdByName(
                    RoleNames.Learner
                );

            if (!learnerRoleId.HasValue)
            {
                throw new Exception(
                    "Learner role does not exist."
                );
            }


            // -----------------------------------------
            // 4. Hash password
            // -----------------------------------------

            string passwordHash =
                PasswordHelper.HashPassword(
                    dto.Password
                );


            // -----------------------------------------
            // 5. Create User
            // -----------------------------------------

            User user = new User
            {
                // IMPORTANT:
                // Public learner registration
                // NEVER gets an organization.

                OrganizationId = null,

                RoleId = learnerRoleId.Value,

                FirstName = dto.FirstName.Trim(),

                LastName = dto.LastName.Trim(),

                Email = email,

                PasswordHash = passwordHash,

                Phone = dto.Phone,

                IsEmailVerified = false,

                IsActive = true
            };


            // -----------------------------------------
            // 6. Create learner
            // -----------------------------------------

            int userId =
                await _repository.CreateUser(
                    user,
                    true
                );


            // -----------------------------------------
            // 7. Return UserId
            // -----------------------------------------

            return userId;
        }


        // =====================================================
        // ADMIN REGISTRATION
        // Only Super Admin should call this.
        // =====================================================

        public async Task<int> RegisterAdmin(
            RegisterDto dto)
        {
            // ---------------------------------------------
            // 1. Validate OrganizationId
            // ---------------------------------------------

            if (!dto.OrganizationId.HasValue)
            {
                throw new Exception(
                    "OrganizationId is required for Admin registration."
                );
            }


            // ---------------------------------------------
            // 2. Check Organization
            // ---------------------------------------------

            bool organizationExists =
                await _repository.OrganizationExists(
                    dto.OrganizationId.Value
                );

            if (!organizationExists)
            {
                throw new Exception(
                    "Organization does not exist or is inactive."
                );
            }


            // ---------------------------------------------
            // 3. Normalize email
            // ---------------------------------------------

            string email =
                dto.Email.Trim().ToLower();


            // ---------------------------------------------
            // 4. Check duplicate email
            // ---------------------------------------------

            bool emailExists =
                await _repository.EmailExists(email);

            if (emailExists)
            {
                throw new Exception(
                    "Email already registered."
                );
            }


            // ---------------------------------------------
            // 5. Get Admin Role
            // ---------------------------------------------

            int? adminRoleId =
                await _repository.GetRoleIdByName(
                    RoleNames.Admin
                );

            if (!adminRoleId.HasValue)
            {
                throw new Exception(
                    "Admin role does not exist."
                );
            }


            // ---------------------------------------------
            // 6. Hash Password
            // ---------------------------------------------

            string passwordHash =
                PasswordHelper.HashPassword(
                    dto.Password
                );


            // ---------------------------------------------
            // 7. Create Admin User
            // ---------------------------------------------

            User user = new User
            {
                OrganizationId =
                    dto.OrganizationId.Value,

                RoleId =
                    adminRoleId.Value,

                FirstName =
                    dto.FirstName.Trim(),

                LastName =
                    dto.LastName.Trim(),

                Email = email,

                PasswordHash =
                    passwordHash,

                Phone =
                    dto.Phone?.Trim(),

                IsEmailVerified = false,

                IsActive = true
            };


            // ---------------------------------------------
            // 8. Create User
            // Admin does not need LearnerProfile
            // ---------------------------------------------

            int userId =
                await _repository.CreateUser(
                    user,
                    false
                );


            return userId;
        }


        // =====================================================
        // ORGANIZATION LEARNER REGISTRATION
        // Admin OR Super Admin can use this.
        // =====================================================

        public async Task<int> RegisterOrganizationLearner(
            RegisterDto dto,
            int organizationId)
        {
            // ---------------------------------------------
            // 1. Check Organization
            // ---------------------------------------------

            bool organizationExists =
                await _repository.OrganizationExists(
                    organizationId
                );

            if (!organizationExists)
            {
                throw new Exception(
                    "Organization does not exist or is inactive."
                );
            }


            // ---------------------------------------------
            // 2. Normalize email
            // ---------------------------------------------

            string email =
                dto.Email.Trim().ToLower();


            // ---------------------------------------------
            // 3. Check duplicate email
            // ---------------------------------------------

            bool emailExists =
                await _repository.EmailExists(email);

            if (emailExists)
            {
                throw new Exception(
                    "Email already registered."
                );
            }


            // ---------------------------------------------
            // 4. Get Learner Role
            // ---------------------------------------------

            int? learnerRoleId =
                await _repository.GetRoleIdByName(
                    RoleNames.Learner
                );

            if (!learnerRoleId.HasValue)
            {
                throw new Exception(
                    "Learner role does not exist."
                );
            }


            // ---------------------------------------------
            // 5. Hash Password
            // ---------------------------------------------

            string passwordHash =
                PasswordHelper.HashPassword(
                    dto.Password
                );


            // ---------------------------------------------
            // 6. Create Learner
            // ---------------------------------------------

            User user = new User
            {
                OrganizationId =
                    organizationId,

                RoleId =
                    learnerRoleId.Value,

                FirstName =
                    dto.FirstName.Trim(),

                LastName =
                    dto.LastName.Trim(),

                Email = email,

                PasswordHash =
                    passwordHash,

                Phone =
                    dto.Phone?.Trim(),

                IsEmailVerified = false,

                IsActive = true
            };


            // ---------------------------------------------
            // 7. Create User + Learner Profile
            // ---------------------------------------------

            int userId =
                await _repository.CreateUser(
                    user,
                    true
                );


            return userId;
        }


        // =====================================================
        // LOGIN
        // =====================================================

        public async Task<LoginResponseDto?> Login(
            LoginDto dto)
        {
            // ---------------------------------------------
            // 1. Normalize email
            // ---------------------------------------------

            string email =
                dto.Email.Trim().ToLower();


            // ---------------------------------------------
            // 2. Find User
            // ---------------------------------------------

            User? user =
                await _repository.GetUserByEmail(
                    email
                );


            // ---------------------------------------------
            // 3. User does not exist
            // ---------------------------------------------

            if (user == null)
            {
                return null;
            }


            // ---------------------------------------------
            // 4. Check Active
            // ---------------------------------------------

            if (!user.IsActive)
            {
                return null;
            }


            // ---------------------------------------------
            // 5. Verify Password
            // ---------------------------------------------

            bool passwordValid =
                PasswordHelper.VerifyPassword(
                    dto.Password,
                    user.PasswordHash
                );

            if (!passwordValid)
            {
                return null;
            }


            // ---------------------------------------------
            // 6. Generate JWT
            // ---------------------------------------------

            string token =
                _jwtHelper.GenerateToken(
                    user.UserId,
                    user.Email,
                    user.RoleName!,
                    user.OrganizationId
                );


            // ---------------------------------------------
            // 7. Return Login Response
            // ---------------------------------------------

            return new LoginResponseDto
            {
                Token = token,

                UserId =
                    user.UserId,

                Email =
                    user.Email,

                Role =
                    user.RoleName!,

                OrganizationId =
                    user.OrganizationId
            };
        }
    }
}
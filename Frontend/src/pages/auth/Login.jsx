
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Layers,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5182"
).replace(/\/+$/, "");

function getRole(data) {
  const role =
    data?.role ??
    data?.Role ??
    data?.roleName ??
    data?.RoleName ??
    data?.user?.role ??
    data?.User?.RoleName;

  if (typeof role === "string") return role;

  if (Array.isArray(role)) return role[0] || "";

  return "";
}

function getDashboardPath(role) {
  const normalizedRole = role.toLowerCase().replace(/[\s_-]/g, "");

  if (normalizedRole === "superadmin") return "/superadmin";
  if (normalizedRole === "admin") return "/admin";
  if (normalizedRole === "learner") return "/learner";

  return null;
}

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.Message ||
            "Login failed. Please check your credentials."
        );
      }

      const token =
        data.token ??
        data.Token ??
        data.accessToken ??
        data.AccessToken;

      const role = getRole(data);
      const dashboardPath = getDashboardPath(role);

      if (!token) {
        throw new Error(
          "Login succeeded, but the API response did not contain a JWT token. Check the login response in Swagger."
        );
      }

      if (!dashboardPath) {
        throw new Error(
          "Login succeeded, but the API did not return a recognized role. Check the login response in Swagger."
        );
      }

      localStorage.setItem("skillmesh_token", token);
      localStorage.setItem("skillmesh_role", role);

      const user = data.user ?? data.User ?? data;

      localStorage.setItem(
        "skillmesh_user",
        JSON.stringify({
          userId: user.userId ?? user.UserId ?? data.userId ?? data.UserId,
          firstName: user.firstName ?? user.FirstName ?? "",
          lastName: user.lastName ?? user.LastName ?? "",
          email: user.email ?? user.Email ?? form.email.trim(),
          role,
        })
      );

      navigate(dashboardPath, { replace: true });
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server. Check the API URL, backend status, and CORS settings."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-[#121E3A] p-10 text-white md:flex">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-indigo-500 p-3">
                <Layers size={25} />
              </span>
              <span className="text-2xl font-bold">SkillMesh</span>
            </div>

            <h1 className="mt-20 text-4xl font-bold leading-tight">
              Build your skills.
              <br />
              Shape your future.
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-slate-300">
              Discover skill gaps, explore personalized learning paths, and
              move closer to your career goals.
            </p>
          </div>

          <p className="text-sm text-slate-400">
            Skill Intelligence & Adaptive Learning
          </p>
        </div>

        <div className="p-7 sm:p-10">
          <div className="mb-8 md:hidden">
            <h1 className="text-2xl font-bold text-[#17233F]">
              SkillMesh
            </h1>
          </div>

          <p className="text-sm font-semibold text-indigo-600">
            WELCOME BACK
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#17233F]">
            Sign in to your account
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            Enter your credentials to continue to your workspace.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-indigo-500">
                <Mail size={18} className="text-slate-400" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full py-3.5 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-indigo-500">
                <LockKeyhole size={18} className="text-slate-400" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full py-3.5 text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-indigo-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#5540F5] py-3.5 font-semibold text-white transition hover:bg-[#4430DF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

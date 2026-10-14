import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Network, Mail, LockKeyhole, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Learner");
  const [email, setEmail] = useState("ayesha@skillmesh.com");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");

    if (role === "Super Admin") navigate("/superadmin");
    else if (role === "Admin") navigate("/admin");
    else navigate("/learner");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC] p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-[#111D3A] p-12 text-white md:flex">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#5540F5] p-3">
              <Network size={28} />
            </div>
            <span className="text-2xl font-bold">SkillMesh</span>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[3px] text-[#A9A1FF]">
              Skill Intelligence Platform
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight">
              Build your skills.
              <br />
              Shape your future.
            </h1>
            <p className="mt-5 max-w-sm leading-7 text-slate-300">
              Discover skill gaps, explore personalized learning paths, and move
              closer to your career goals.
            </p>
            <div className="mt-8 flex gap-2">
              <span className="h-1.5 w-10 rounded-full bg-[#5540F5]" />
              <span className="h-1.5 w-5 rounded-full bg-slate-600" />
              <span className="h-1.5 w-5 rounded-full bg-slate-600" />
            </div>
          </div>

          <p className="text-sm text-slate-400">Learn · Practice · Grow</p>
        </div>

        <div className="p-6 sm:p-12">
          <div className="mb-9 flex items-center gap-3 md:hidden">
            <div className="rounded-xl bg-[#5540F5] p-2.5 text-white">
              <Network size={23} />
            </div>
            <span className="text-xl font-bold text-[#111D3A]">SkillMesh</span>
          </div>

          <p className="text-xs font-bold tracking-[2px] text-[#5540F5]">
            WELCOME BACK
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[#17233F]">
            Sign in to SkillMesh
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter your details to explore your workspace.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Workspace role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#5540F5] focus:ring-2 focus:ring-[#5540F5]/10"
              >
                <option>Learner</option>
                <option>Admin</option>
                <option>Super Admin</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-[#5540F5]">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full py-3.5 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-[#5540F5]">
                <LockKeyhole size={18} className="text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full py-3.5 text-sm outline-none"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5540F5] py-3.5 font-semibold text-white transition hover:bg-[#4430DF]"
            >
              Sign In <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            New to SkillMesh?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#5540F5] hover:underline"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-5 text-center text-xs text-slate-400">
            UI demo only · No real authentication
          </p>
        </div>
      </div>
    </div>
  );
}

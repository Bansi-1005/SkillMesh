import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Network, UserRound, Mail, LockKeyhole } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function submit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    window.alert("Demo registration completed. No account was saved.");
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC] p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-[#111D3A] p-12 text-white md:flex">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#5540F5] p-3">
              <Network size={27} />
            </div>
            <span className="text-2xl font-bold">SkillMesh</span>
          </div>

          <div>
            <h1 className="text-4xl font-bold leading-tight">
              Your next skill
              <br />
              starts here.
            </h1>
            <p className="mt-5 leading-7 text-slate-300">
              Create your learner profile and start exploring a personalized
              path toward your target career.
            </p>
          </div>

          <p className="text-sm text-slate-400">Learn · Practice · Grow</p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <Network className="text-[#5540F5]" size={26} />
            <span className="text-xl font-bold text-[#111D3A]">SkillMesh</span>
          </div>

          <p className="text-xs font-bold tracking-[2px] text-[#5540F5]">
            GET STARTED
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[#17233F]">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Registration is available for learners in this demo.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  First name
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={change}
                  placeholder="First name"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#5540F5]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Last name
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={change}
                  placeholder="Last name"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#5540F5]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3">
                <Mail size={17} className="text-slate-400" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={change}
                  placeholder="you@example.com"
                  required
                  className="w-full py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3">
                <LockKeyhole size={17} className="text-slate-400" />
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={change}
                  placeholder="Minimum 8 characters"
                  required
                  className="w-full py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Confirm password
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={change}
                placeholder="Re-enter password"
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#5540F5]"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#5540F5] py-3.5 font-semibold text-white hover:bg-[#4430DF]"
            >
              Create Learner Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#5540F5] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

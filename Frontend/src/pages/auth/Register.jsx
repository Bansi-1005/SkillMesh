import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound, Mail, LockKeyhole, Layers } from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5182"
).replace(/\/+$/, "");

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/Auth/register/learner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          password: form.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.Message ||
            "Registration failed. Please check your details.",
        );
      }

      setSuccess(
        data.message ||
          data.Message ||
          "Your account has been created successfully.",
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server. Check the API URL, backend status, and CORS settings."
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC] px-4 py-8">
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
              Start your
              <br />
              learning journey.
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-slate-300">
              Understand your skills, identify areas for improvement, and follow
              a learning path designed around your career goals.
            </p>
          </div>

          <p className="text-sm text-slate-400">Learn. Improve. Grow.</p>
        </div>

        <div className="p-7 sm:p-10">
          <div className="mb-6 md:hidden">
            <h1 className="text-2xl font-bold text-[#17233F]">SkillMesh</h1>
          </div>

          <p className="text-sm font-semibold text-indigo-600">
            CREATE YOUR ACCOUNT
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#17233F]">
            Join SkillMesh
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            Create your learner account to get started.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="text-sm font-medium text-slate-700"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  autoComplete="given-name"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="text-sm font-medium text-slate-700"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  autoComplete="family-name"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="text-sm font-medium text-slate-700"
              >
                Phone number (optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-indigo-50 p-3">
              <UserRound
                size={19}
                className="mt-0.5 shrink-0 text-indigo-600"
              />
              <p className="text-sm text-slate-600">
                Account type:{" "}
                <span className="font-semibold text-[#17233F]">Learner</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#5540F5] py-3.5 font-semibold text-white transition hover:bg-[#4430DF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Network, UserRound, Mail, LockKeyhole } from "lucide-react";

// export default function Register() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [error, setError] = useState("");

//   function change(e) {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   }

//   function submit(e) {
//     e.preventDefault();
//     setError("");

//     if (form.password.length < 8) {
//       setError("Password must contain at least 8 characters.");
//       return;
//     }

//     if (form.password !== form.confirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }

//     window.alert("Demo registration completed. No account was saved.");
//     navigate("/login");
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC] p-4">
//       <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
//         <div className="hidden flex-col justify-between bg-[#111D3A] p-12 text-white md:flex">
//           <div className="flex items-center gap-3">
//             <div className="rounded-xl bg-[#5540F5] p-3">
//               <Network size={27} />
//             </div>
//             <span className="text-2xl font-bold">SkillMesh</span>
//           </div>

//           <div>
//             <h1 className="text-4xl font-bold leading-tight">
//               Your next skill
//               <br />
//               starts here.
//             </h1>
//             <p className="mt-5 leading-7 text-slate-300">
//               Create your learner profile and start exploring a personalized
//               path toward your target career.
//             </p>
//           </div>

//           <p className="text-sm text-slate-400">Learn · Practice · Grow</p>
//         </div>

//         <div className="p-6 sm:p-10">
//           <div className="mb-6 flex items-center gap-3 md:hidden">
//             <Network className="text-[#5540F5]" size={26} />
//             <span className="text-xl font-bold text-[#111D3A]">SkillMesh</span>
//           </div>

//           <p className="text-xs font-bold tracking-[2px] text-[#5540F5]">
//             GET STARTED
//           </p>
//           <h2 className="mt-2 text-3xl font-bold text-[#17233F]">
//             Create an account
//           </h2>
//           <p className="mt-2 text-sm text-slate-500">
//             Registration is available for learners in this demo.
//           </p>

//           <form onSubmit={submit} className="mt-6 space-y-4">
//             <div className="grid gap-4 sm:grid-cols-2">
//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-slate-700">
//                   First name
//                 </label>
//                 <input
//                   name="firstName"
//                   value={form.firstName}
//                   onChange={change}
//                   placeholder="First name"
//                   required
//                   className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#5540F5]"
//                 />
//               </div>
//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-slate-700">
//                   Last name
//                 </label>
//                 <input
//                   name="lastName"
//                   value={form.lastName}
//                   onChange={change}
//                   placeholder="Last name"
//                   required
//                   className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#5540F5]"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-semibold text-slate-700">
//                 Email address
//               </label>
//               <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3">
//                 <Mail size={17} className="text-slate-400" />
//                 <input
//                   name="email"
//                   type="email"
//                   value={form.email}
//                   onChange={change}
//                   placeholder="you@example.com"
//                   required
//                   className="w-full py-3 text-sm outline-none"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-semibold text-slate-700">
//                 Password
//               </label>
//               <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3">
//                 <LockKeyhole size={17} className="text-slate-400" />
//                 <input
//                   name="password"
//                   type="password"
//                   minLength={8}
//                   value={form.password}
//                   onChange={change}
//                   placeholder="Minimum 8 characters"
//                   required
//                   className="w-full py-3 text-sm outline-none"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-semibold text-slate-700">
//                 Confirm password
//               </label>
//               <input
//                 name="confirmPassword"
//                 type="password"
//                 value={form.confirmPassword}
//                 onChange={change}
//                 placeholder="Re-enter password"
//                 required
//                 className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#5540F5]"
//               />
//             </div>

//             {error && (
//               <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
//                 {error}
//               </p>
//             )}

//             <button
//               type="submit"
//               className="w-full rounded-xl bg-[#5540F5] py-3.5 font-semibold text-white hover:bg-[#4430DF]"
//             >
//               Create Learner Account
//             </button>
//           </form>

//           <p className="mt-6 text-center text-sm text-slate-500">
//             Already registered?{" "}
//             <Link
//               to="/login"
//               className="font-semibold text-[#5540F5] hover:underline"
//             >
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

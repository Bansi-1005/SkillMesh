import {
  Users,
  Brain,
  BookOpen,
  ClipboardCheck,
  Building2,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";

const stats = [
  {
    label: "Total Learners",
    value: "248",
    note: "+18 this month",
    icon: Users,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    label: "Available Skills",
    value: "64",
    note: "8 categories",
    icon: Brain,
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "Published Courses",
    value: "32",
    note: "6 recently added",
    icon: BookOpen,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Assessments",
    value: "18",
    note: "4 active this week",
    icon: ClipboardCheck,
    color: "bg-amber-50 text-amber-600",
  },
];

const learners = [
  {
    name: "Ayesha Patel",
    role: "Frontend Developer",
    progress: 78,
    status: "On Track",
  },
  {
    name: "Rohan Shah",
    role: "Backend Developer",
    progress: 56,
    status: "In Progress",
  },
  {
    name: "Priya Mehta",
    role: "Data Analyst",
    progress: 91,
    status: "On Track",
  },
  {
    name: "Dev Joshi",
    role: "Frontend Developer",
    progress: 32,
    status: "Needs Support",
  },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout role="Admin">
      <p className="text-sm text-slate-500">Organization workspace</p>
      <h1 className="mt-2 text-3xl font-bold text-[#17233F]">
        Welcome back, Rahul
      </h1>
      <p className="mt-2 text-slate-500">
        Monitor learners, skills, and organizational learning activities.
      </p>

      <section className="mt-8 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="rounded-xl bg-[#EEECFF] p-3 text-[#5540F5]">
          <Building2 size={26} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            Organization
          </p>
          <h2 className="mt-1 text-xl font-bold text-[#17233F]">
            SkillMesh Technologies
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Organization Code: SKM-001
          </p>
        </div>
        <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
          Active
        </span>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase text-slate-400">
                {label}
              </p>
              <span className={`rounded-xl p-2 ${color}`}>
                <Icon size={19} />
              </span>
            </div>
            <p className="mt-5 text-3xl font-bold text-[#17233F]">{value}</p>
            <p className="mt-2 text-xs text-slate-500">{note}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#17233F]">Learner progress</h2>
        <p className="mt-1 text-sm text-slate-500">
          Recent learning-path completion.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[550px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-slate-400">
              <tr>
                <th className="pb-3">Learner</th>
                <th className="pb-3">Target role</th>
                <th className="pb-3">Progress</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {learners.map((learner) => (
                <tr key={learner.name} className="border-b border-slate-50">
                  <td className="py-4 font-semibold text-slate-700">
                    {learner.name}
                  </td>
                  <td className="py-4 text-slate-500">{learner.role}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full bg-[#5540F5]"
                          style={{ width: `${learner.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">
                        {learner.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-600">
                      {learner.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  );
}

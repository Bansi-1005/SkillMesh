import { Building2, Users, ShieldCheck, Brain, Activity } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";

const stats = [
  {
    label: "Organizations",
    value: "24",
    note: "21 active",
    icon: Building2,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    label: "Total Users",
    value: "3,840",
    note: "+126 this month",
    icon: Users,
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "Administrators",
    value: "28",
    note: "Across organizations",
    icon: ShieldCheck,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Skill Records",
    value: "156",
    note: "Across categories",
    icon: Brain,
    color: "bg-amber-50 text-amber-600",
  },
];

const organizations = [
  {
    name: "SkillMesh Technologies",
    code: "SKM-001",
    users: 248,
    status: "Active",
  },
  {
    name: "Bright Future Institute",
    code: "BFI-002",
    users: 186,
    status: "Active",
  },
  { name: "NextGen Solutions", code: "NGS-003", users: 124, status: "Active" },
  {
    name: "FutureLearn Academy",
    code: "FLA-004",
    users: 96,
    status: "Pending",
  },
];

export default function SuperAdminDashboard() {
  return (
    <DashboardLayout role="Super Admin" title="Platform Overview">
      <p className="text-sm text-slate-500">Platform administration</p>
      <h1 className="mt-2 text-3xl font-bold text-[#17233F]">
        Welcome back, System Admin
      </h1>
      <p className="mt-2 text-slate-500">
        Manage organizations, administrators, users, and platform-wide skills.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-bold text-[#17233F]">
            Registered organizations
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Overview of organizations using SkillMesh.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[450px] text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Organization</th>
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Users</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.code} className="border-b border-slate-50">
                    <td className="py-4 font-semibold text-slate-700">
                      {org.name}
                    </td>
                    <td className="py-4 text-slate-500">{org.code}</td>
                    <td className="py-4 text-slate-600">{org.users}</td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${org.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                      >
                        {org.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#17233F]">
            Platform overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">Static demo indicators.</p>

          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
            <Activity size={22} className="text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Demo system status
              </p>
              <p className="mt-1 text-xs text-emerald-600">
                Illustrative data only
              </p>
            </div>
          </div>

          {[
            ["Active organizations", 88],
            ["Active users", 76],
            ["Published learning content", 82],
          ].map(([label, value]) => (
            <div key={label} className="mt-6">
              <div className="mb-2 flex justify-between gap-2 text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-semibold text-[#17233F]">{value}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-[#5540F5]"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}

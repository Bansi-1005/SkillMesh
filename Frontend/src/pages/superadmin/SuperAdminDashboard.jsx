
import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  ShieldCheck,
  Brain,
  Activity,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5182";

const formatNumber = (value) =>
  Number(value ?? 0).toLocaleString("en-IN");

function StatCard({ label, value, note, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <span className={`rounded-xl p-2.5 ${color}`}>
          <Icon size={20} />
        </span>
      </div>

      <p className="mt-5 text-3xl font-bold text-[#17233F]">
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function UserGrowthChart({ registrations = [] }) {
  const values = registrations.map((item) => Number(item.users ?? 0));
  const maxValue = Math.max(...values, 1);

  const chartWidth = 600;
  const chartHeight = 210;
  const left = 36;
  const right = 12;
  const top = 18;
  const bottom = 30;
  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;

  const points = registrations.map((item, index) => {
    const x =
      registrations.length <= 1
        ? left + plotWidth / 2
        : left + (index / (registrations.length - 1)) * plotWidth;

    const y = top + plotHeight - (Number(item.users ?? 0) / maxValue) * plotHeight;

    return { x, y, month: item.month, users: Number(item.users ?? 0) };
  });

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints =
    points.length > 0
      ? `${left},${top + plotHeight} ${linePoints} ${points[points.length - 1].x},${top + plotHeight}`
      : "";

  return (
    <div>
      {registrations.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-slate-500">
          No monthly registration data available.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-2xl font-bold text-[#17233F]">
                {formatNumber(values.reduce((sum, value) => sum + value, 0))}
              </p>
              <p className="text-xs text-slate-500">
                Registrations across the displayed months
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
              <TrendingUp size={14} />
              Last 6 months
            </span>
          </div>

          <div className="mt-4 w-full">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label="Monthly user registrations line chart"
              className="h-auto w-full overflow-visible"
            >
              {[0, 1, 2, 3].map((step) => {
                const y = top + (plotHeight / 3) * step;
                const value = Math.round(maxValue * (1 - step / 3));

                return (
                  <g key={step}>
                    <line
                      x1={left}
                      y1={y}
                      x2={chartWidth - right}
                      y2={y}
                      stroke="#E9EDF5"
                      strokeDasharray="4 5"
                    />
                    <text
                      x={left - 8}
                      y={y + 4}
                      fontSize="10"
                      textAnchor="end"
                      fill="#94A3B8"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              <polygon points={areaPoints} fill="#5540F5" opacity="0.09" />

              <polyline
                points={linePoints}
                fill="none"
                stroke="#5540F5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {points.map((point, index) => (
                <g key={`${point.month}-${index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4.5"
                    fill="#FFFFFF"
                    stroke="#5540F5"
                    strokeWidth="2.5"
                  />
                  <text
                    x={point.x}
                    y={chartHeight - 7}
                    fontSize="11"
                    textAnchor="middle"
                    fill="#64748B"
                  >
                    {point.month}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

function OrganizationStatusChart({ total = 0, active = 0 }) {
  const safeTotal = Math.max(0, Number(total ?? 0));
  const safeActive = Math.min(
    safeTotal,
    Math.max(0, Number(active ?? 0))
  );
  const inactive = Math.max(0, safeTotal - safeActive);
  const activePercentage =
    safeTotal > 0 ? Math.round((safeActive / safeTotal) * 100) : 0;

  const inactivePercentage = 100 - activePercentage;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
      <div
        className="relative grid h-40 w-40 shrink-0 place-items-center rounded-full"
        style={{
          background: `conic-gradient(#5540F5 0% ${activePercentage}%, #E2E8F0 ${activePercentage}% 100%)`,
        }}
        role="img"
        aria-label={`${safeActive} active and ${inactive} inactive organizations`}
      >
        <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center">
          <div>
            <p className="text-3xl font-bold text-[#17233F]">
              {formatNumber(safeTotal)}
            </p>
            <p className="text-xs text-slate-500">Organizations</p>
          </div>
        </div>
      </div>

      <div className="w-full space-y-5 sm:w-auto sm:min-w-36">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#5540F5]" />
            <span className="text-sm text-slate-600">Active</span>
            <span className="ml-auto font-bold text-[#17233F]">
              {formatNumber(safeActive)}
            </span>
          </div>
          <p className="ml-5 mt-1 text-xs text-slate-400">
            {activePercentage}% of all organizations
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-slate-200" />
            <span className="text-sm text-slate-600">Inactive</span>
            <span className="ml-auto font-bold text-[#17233F]">
              {formatNumber(inactive)}
            </span>
          </div>
          <p className="ml-5 mt-1 text-xs text-slate-400">
            {inactivePercentage}% of all organizations
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("skillmesh_token");

      if (!token) {
        throw new Error(
          "Authentication token not found. Please log in again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/SuperAdminDashboard`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Your session is invalid or expired. Please log in again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "Access denied. This dashboard requires the Super Admin role."
          );
        }

        const responseText = await response.text();
        throw new Error(
          responseText ||
            `Unable to load dashboard. HTTP ${response.status}`
        );
      }

      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      setError(
        err.message || "Something went wrong while loading the dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = dashboard
    ? [
        {
          label: "Organizations",
          value: formatNumber(dashboard.totalOrganizations),
          note: `${formatNumber(dashboard.activeOrganizations)} active`,
          icon: Building2,
          color: "bg-indigo-50 text-indigo-600",
        },
        {
          label: "Total Users",
          value: formatNumber(dashboard.totalUsers),
          note: `+${formatNumber(dashboard.newUsersThisMonth)} this month`,
          icon: Users,
          color: "bg-purple-50 text-purple-600",
        },
        {
          label: "Administrators",
          value: formatNumber(dashboard.totalAdmins),
          note: "Users with the Admin role",
          icon: ShieldCheck,
          color: "bg-emerald-50 text-emerald-600",
        },
        {
          label: "Skill Records",
          value: formatNumber(dashboard.totalSkills),
          note: "Total skills in the platform",
          icon: Brain,
          color: "bg-amber-50 text-amber-600",
        },
      ]
    : [];

  const organizations = dashboard?.recentOrganizations ?? [];
  const registrations = dashboard?.monthlyUserRegistrations ?? [];

  const indicators = dashboard
    ? [
        ["Active users", dashboard.activeUsersPercentage],
        ["Published learning content", dashboard.publishedCoursesPercentage],
      ]
    : [];

  return (
    <DashboardLayout role="Super Admin" title="Platform Overview">
      <p className="text-sm text-slate-500">Platform administration</p>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#17233F]">
            Welcome back, System Admin
          </h1>
          <p className="mt-2 text-slate-500">
            Monitor organizations, users, skills, and learning activity across SkillMesh.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboard}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load dashboard data</p>
            <p className="mt-1 break-words">{error}</p>
            <button
              type="button"
              onClick={fetchDashboard}
              className="mt-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {loading && !dashboard ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="h-3 w-28 rounded bg-slate-200" />
              <div className="mt-6 h-8 w-20 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-32 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : dashboard ? (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
              <div className="mb-5 flex items-start gap-3">
                <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                  <TrendingUp size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#17233F]">
                    User growth
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Monthly user registrations across the platform.
                  </p>
                </div>
              </div>
              <UserGrowthChart registrations={registrations} />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-7 flex items-start gap-3">
                <span className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
                  <Building2 size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#17233F]">
                    Organization status
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Active and inactive organizations.
                  </p>
                </div>
              </div>

              <OrganizationStatusChart
                total={dashboard.totalOrganizations}
                active={dashboard.activeOrganizations}
              />
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#17233F]">
                    Top organizations
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    The seven organizations with the most registered users.
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  Top 7
                </span>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="border-b text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="pb-3 pr-3">Organization</th>
                      <th className="pb-3 pr-3">Code</th>
                      <th className="pb-3 pr-3">Users</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.length > 0 ? (
                      organizations.map((org, index) => (
                        <tr
                          key={org.code || `${org.name}-${index}`}
                          className="border-b border-slate-50 transition hover:bg-slate-50/70"
                        >
                          <td className="py-4 pr-3 font-semibold text-slate-700">
                            <div className="flex items-center gap-3">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                                <Building2 size={17} />
                              </span>
                              <span>{org.name}</span>
                            </div>
                          </td>
                          <td className="py-4 pr-3 text-slate-500">
                            {org.code || "—"}
                          </td>
                          <td className="py-4 pr-3 font-semibold text-slate-700">
                            {formatNumber(org.users)}
                          </td>
                          <td className="py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                org.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  org.status === "Active"
                                    ? "bg-emerald-500"
                                    : "bg-amber-500"
                                }`}
                              />
                              {org.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-slate-500"
                        >
                          No organizations found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-[#17233F]">
                Learning content
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Published learning resources on SkillMesh.
              </p>

              <div className="mt-6 flex items-center gap-4 rounded-xl bg-purple-50 p-4">
                <span className="rounded-xl bg-white p-3 text-purple-600 shadow-sm">
                  <BookOpen size={22} />
                </span>
                <div>
                  <p className="text-2xl font-bold text-[#17233F]">
                    {formatNumber(dashboard.totalCourses)}
                  </p>
                  <p className="text-xs text-slate-500">Total courses</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 rounded-xl bg-emerald-50 p-4">
                <span className="rounded-xl bg-white p-3 text-emerald-600 shadow-sm">
                  <CheckCircle2 size={22} />
                </span>
                <div>
                  <p className="text-2xl font-bold text-[#17233F]">
                    {formatNumber(dashboard.publishedCourses)}
                  </p>
                  <p className="text-xs text-slate-500">Published courses</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span className="text-slate-600">Publication rate</span>
                  <span className="font-bold text-[#17233F]">
                    {Math.max(
                      0,
                      Math.min(100, Number(dashboard.publishedCoursesPercentage ?? 0))
                    )}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#5540F5] transition-all duration-500"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, Number(dashboard.publishedCoursesPercentage ?? 0))
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="mb-4 text-sm font-bold text-[#17233F]">
                  Platform activity
                </h3>
                {indicators.map(([label, value]) => {
                  const percentage = Math.max(
                    0,
                    Math.min(100, Number(value ?? 0))
                  );

                  return (
                    <div key={label} className="mb-4 last:mb-0">
                      <div className="mb-2 flex justify-between gap-2 text-xs">
                        <span className="text-slate-500">{label}</span>
                        <span className="font-semibold text-[#17233F]">
                          {percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full bg-emerald-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <GraduationCap size={19} className="text-indigo-600" />
                <p className="text-xs text-slate-600">
                  SkillMesh learning and career development platform
                </p>
              </div>
            </div>
          </section>

          <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500">
            <Activity size={16} className="text-emerald-600" />
            Dashboard statistics are retrieved from your SkillMesh API.
          </div>
        </>
      ) : (
        !error && (
          <p className="mt-8 text-sm text-slate-500">
            No dashboard data is available.
          </p>
        )
      )}
    </DashboardLayout>
  );
}

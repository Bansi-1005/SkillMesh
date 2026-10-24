
import { useCallback, useEffect, useState } from "react";
import {
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
  UserCheck,
  BarChart3,
  Sparkles,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5182";

const formatNumber = (value) =>
  Number(value ?? 0).toLocaleString("en-IN");

const getPercentage = (value) =>
  Math.max(0, Math.min(100, Number(value ?? 0)));

function StatCard({ label, value, note, icon: Icon, iconStyle }) {
  return (
    <div className="group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`rounded-xl p-3 ${iconStyle}`}>
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight text-[#17233F]">
        {formatNumber(value)}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>
    </div>
  );
}

function SectionHeading({ icon: Icon, title, description, color }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`shrink-0 rounded-xl p-3 ${color}`}>
        <Icon size={21} />
      </div>
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-[#17233F]">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function UserGrowthChart({ registrations = [] }) {
  const values = registrations.map((item) =>
    Number(item.users ?? 0)
  );

  const totalRegistrations = values.reduce(
    (sum, value) => sum + value,
    0
  );

  const maxValue = Math.max(...values, 1);

  const chartWidth = 600;
  const chartHeight = 245;
  const left = 42;
  const right = 18;
  const top = 24;
  const bottom = 38;

  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;

  const points = registrations.map((item, index) => {
    const users = Number(item.users ?? 0);

    const x =
      registrations.length <= 1
        ? left + plotWidth / 2
        : left + (index / (registrations.length - 1)) * plotWidth;

    const y =
      top + plotHeight - (users / maxValue) * plotHeight;

    return {
      x,
      y,
      month: item.month ?? "",
      users,
    };
  });

  const linePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const areaPoints =
    points.length > 1
      ? `${left},${top + plotHeight} ${linePoints} ${
          points[points.length - 1].x
        },${top + plotHeight}`
      : "";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-3xl font-bold text-[#17233F]">
            {formatNumber(totalRegistrations)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Registrations during the displayed period
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600">
          <TrendingUp size={15} />
          Last 6 months
        </span>
      </div>

      {registrations.length === 0 ? (
        <div className="mt-5 flex h-56 flex-col items-center justify-center rounded-xl bg-slate-50 text-center">
          <BarChart3 size={32} className="text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            No registration history available
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Registration data will appear here when provided by the API.
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            role="img"
            aria-label="Monthly user registrations"
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
                    stroke="#E2E8F0"
                    strokeDasharray="4 5"
                  />
                  <text
                    x={left - 9}
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

            {points.length > 1 && (
              <polygon
                points={areaPoints}
                fill="#5540F5"
                opacity="0.09"
              />
            )}

            {points.length > 1 && (
              <polyline
                points={linePoints}
                fill="none"
                stroke="#5540F5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {points.map((point, index) => (
              <g key={`${point.month}-${index}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="white"
                  stroke="#5540F5"
                  strokeWidth="2.5"
                />
                <text
                  x={point.x}
                  y={chartHeight - 8}
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
      )}
    </div>
  );
}

function ProgressBar({ label, value, color = "bg-emerald-500" }) {
  const percentage = getPercentage(value);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-[#17233F]">
          {percentage}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function UserBreakdown({ dashboard }) {
  const totalUsers = Number(dashboard.totalUsers ?? 0);
  const totalAdmins = Number(dashboard.totalAdmins ?? 0);
  const activeUsers = Number(dashboard.activeUsers ?? 0);
  const learners = Math.max(0, totalUsers - totalAdmins);

  const activePercentage =
    dashboard.activeUsersPercentage ??
    (totalUsers > 0
      ? Math.round((activeUsers / totalUsers) * 100)
      : 0);

  const adminPercentage =
    totalUsers > 0
      ? Math.round((totalAdmins / totalUsers) * 100)
      : 0;

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
      <SectionHeading
        icon={Users}
        title="User Breakdown"
        description="Understand the composition of your platform users."
        color="bg-indigo-50 text-indigo-600"
      />

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
          <div className="rounded-xl bg-white p-3 text-indigo-600 shadow-sm">
            <GraduationCap size={21} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[#17233F]">Learners</p>
            <p className="mt-1 text-xs text-slate-500">
              Accounts without the Admin role
            </p>
          </div>
          <p className="text-2xl font-bold text-[#17233F]">
            {formatNumber(learners)}
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
          <div className="rounded-xl bg-white p-3 text-emerald-600 shadow-sm">
            <ShieldCheck size={21} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[#17233F]">Administrators</p>
            <p className="mt-1 text-xs text-slate-500">
              Users with the Admin role
            </p>
          </div>
          <p className="text-2xl font-bold text-[#17233F]">
            {formatNumber(totalAdmins)}
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <h3 className="mb-5 text-sm font-bold text-[#17233F]">
          Account health
        </h3>

        <div className="space-y-5">
          <ProgressBar
            label="Active accounts"
            value={activePercentage}
          />
          <ProgressBar
            label="Administrator share"
            value={adminPercentage}
            color="bg-indigo-500"
          />
        </div>
      </div>
    </section>
  );
}

function LearningOverview({ dashboard }) {
  const totalCourses = Number(dashboard.totalCourses ?? 0);
  const publishedCourses = Number(dashboard.publishedCourses ?? 0);
  const totalSkills = Number(dashboard.totalSkills ?? 0);

  const publicationPercentage =
    dashboard.publishedCoursesPercentage ??
    (totalCourses > 0
      ? Math.round((publishedCourses / totalCourses) * 100)
      : 0);

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
      <SectionHeading
        icon={BookOpen}
        title="Learning Resources"
        description="A snapshot of the content available on SkillMesh."
        color="bg-purple-50 text-purple-600"
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1">
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
            <Brain size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500">
              Skills in library
            </p>
            <p className="mt-1 text-2xl font-bold text-[#17233F]">
              {formatNumber(totalSkills)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
          <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
            <BookOpen size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500">
              Total courses
            </p>
            <p className="mt-1 text-2xl font-bold text-[#17233F]">
              {formatNumber(totalCourses)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500">
              Published courses
            </p>
            <p className="mt-1 text-2xl font-bold text-[#17233F]">
              {formatNumber(publishedCourses)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <ProgressBar
          label="Course publication rate"
          value={publicationPercentage}
          color="bg-purple-500"
        />
        <p className="mt-3 text-xs leading-5 text-slate-500">
          This percentage compares published courses with all courses
          recorded by the platform.
        </p>
      </div>
    </section>
  );
}

export default function SuperAdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("skillmesh_token");

      if (!token) {
        throw new Error("Please log in again to load dashboard data.");
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
          throw new Error("Your session has expired. Please log in again.");
        }

        if (response.status === 403) {
          throw new Error(
            "Access denied. This page requires the Super Admin role."
          );
        }

        const message = await response.text();
        throw new Error(
          message || `Unable to load dashboard (HTTP ${response.status}).`
        );
      }

      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading the dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const registrations = Array.isArray(
    dashboard?.monthlyUserRegistrations
  )
    ? dashboard.monthlyUserRegistrations
    : [];

  const stats = dashboard
    ? [
        {
          label: "Total Users",
          value: dashboard.totalUsers,
          note: `+${formatNumber(dashboard.newUsersThisMonth)} this month`,
          icon: Users,
          iconStyle: "bg-purple-50 text-purple-600",
        },
        {
          label: "Active Users",
          value: dashboard.activeUsers,
          note: "Currently active user accounts",
          icon: UserCheck,
          iconStyle: "bg-cyan-50 text-cyan-600",
        },
        {
          label: "Administrators",
          value: dashboard.totalAdmins,
          note: "Accounts with the Admin role",
          icon: ShieldCheck,
          iconStyle: "bg-emerald-50 text-emerald-600",
        },
        {
          label: "Skill Records",
          value: dashboard.totalSkills,
          note: "Skills recorded in the platform",
          icon: Brain,
          iconStyle: "bg-amber-50 text-amber-600",
        },
      ]
    : [];

  return (
    <DashboardLayout role="Super Admin" title="Platform Overview">
      <main className="min-w-0 space-y-6 pb-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <Sparkles size={16} />
              <span>Super Admin Workspace</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#17233F] sm:text-3xl">
              Welcome back, System Admin
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Manage platform users, monitor skill development, and review
              learning resources from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboard}
            disabled={loading}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                Unable to load dashboard data
              </p>
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
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="mt-6 h-9 w-20 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-36 rounded bg-slate-100" />
              </div>
            ))}
          </section>
        ) : dashboard ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </section>

            <section className="grid items-stretch gap-6 xl:grid-cols-3">
              <div className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
                <SectionHeading
                  icon={TrendingUp}
                  title="User Growth"
                  description="Track new registrations across the displayed months."
                  color="bg-indigo-50 text-indigo-600"
                />

                <div className="mt-6">
                  <UserGrowthChart registrations={registrations} />
                </div>
              </div>

              <div className="min-w-0">
                <LearningOverview dashboard={dashboard} />
              </div>
            </section>

            <section className="grid items-stretch gap-6 xl:grid-cols-2">
              <UserBreakdown dashboard={dashboard} />

              <section className="flex flex-col justify-between rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm sm:p-8">
                <div>
                  <div className="inline-flex rounded-2xl bg-white p-3 text-indigo-600 shadow-sm">
                    <Activity size={24} />
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-[#17233F]">
                    Your platform at a glance
                  </h2>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
                    SkillMesh brings learners, administrators, skills, and
                    learning resources together in one platform. Use your
                    Super Admin workspace to oversee platform activity and
                    maintain the learning experience.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white bg-white/80 p-4">
                    <Users size={19} className="text-indigo-600" />
                    <p className="mt-3 text-sm font-semibold text-[#17233F]">
                      User Management
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Review and manage user accounts.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white bg-white/80 p-4">
                    <BookOpen size={19} className="text-purple-600" />
                    <p className="mt-3 text-sm font-semibold text-[#17233F]">
                      Learning Resources
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Monitor skills and course availability.
                    </p>
                  </div>
                </div>
              </section>
            </section>

            <footer className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
              <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
              Dashboard statistics are retrieved from the SkillMesh API.
              Refresh to fetch the latest available data.
            </footer>
          </>
        ) : (
          !error && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <BarChart3
                size={36}
                className="mx-auto text-slate-300"
              />
              <h2 className="mt-4 font-semibold text-[#17233F]">
                No dashboard data available
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Try refreshing the page.
              </p>
            </div>
          )
        )}
      </main>
    </DashboardLayout>
  );
}

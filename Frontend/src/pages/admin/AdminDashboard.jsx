import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Brain,
  BookOpen,
  ClipboardCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Activity,
  UserRound,
  ShieldCheck,
  Sparkles,
  CircleUserRound,
  GraduationCap,
  Info,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5182"
).replace(/\/+$/, "");

const initialDashboard = {
  totalLearners: 0,
  availableSkills: 0,
  publishedCourses: 0,
  activeAssessments: 0,
  learners: [],
};

const statConfig = [
  {
    key: "totalLearners",
    label: "Total learners",
    description: "Registered learner profiles",
    icon: Users,
    iconStyle: "bg-indigo-50 text-indigo-600",
    accent: "bg-indigo-500",
  },
  {
    key: "publishedCourses",
    label: "Published courses",
    description: "Available in your organization",
    icon: BookOpen,
    iconStyle: "bg-emerald-50 text-emerald-600",
    accent: "bg-emerald-500",
  },
  {
    key: "availableSkills",
    label: "Available skills",
    description: "Active skills in SkillMesh",
    icon: Brain,
    iconStyle: "bg-violet-50 text-violet-600",
    accent: "bg-violet-500",
  },
  {
    key: "activeAssessments",
    label: "Active assessments",
    description: "Currently active assessments",
    icon: ClipboardCheck,
    iconStyle: "bg-amber-50 text-amber-600",
    accent: "bg-amber-500",
  },
];

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("en-IN");
}

async function fetchDashboard() {
  const token = localStorage.getItem("skillmesh_token");

  const response = await fetch(`${API_BASE_URL}/api/AdminDashboard`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401) {
    throw new Error(
      "Your session may have expired, or your account does not have Admin access. Please sign in again."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "You do not have permission to access the Admin Dashboard."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Dashboard request failed with status ${response.status}. Please check the backend.`
    );
  }

  return response.json();
}

function StatCard({ stat, value, loading }) {
  const Icon = stat.icon;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {stat.label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-[#17233F]">
            {loading ? "—" : formatNumber(value)}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${stat.iconStyle}`}>
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {stat.description}
      </p>

      <div
        className={`absolute bottom-0 left-0 h-1 w-full ${stat.accent}`}
      />
    </article>
  );
}

function SectionHeader({ title, description, icon: Icon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
        <Icon size={19} />
      </div>

      <div>
        <h2 className="font-bold text-[#17233F]">{title}</h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function LegendItem({ color, label, value, percentage }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`}
        />

        <span className="truncate text-sm text-slate-600">
          {label}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="text-sm font-bold text-[#17233F]">
          {formatNumber(value)}
        </span>

        <span className="w-10 text-right text-xs text-slate-400">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function LearnerStatusChart({ active, inactive, loading }) {
  const total = active + inactive;

  const activePercentage = total ? (active / total) * 100 : 0;
  const inactivePercentage = total ? (inactive / total) * 100 : 0;

  const radius = 48;
  const circumference = 2 * Math.PI * radius;

  const activeLength = (active / (total || 1)) * circumference;
  const inactiveLength = (inactive / (total || 1)) * circumference;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <SectionHeader
        title="Learner account status"
        description="Active and inactive accounts in your organization"
        icon={Activity}
      />

      {loading ? (
        <div className="flex h-52 items-center justify-center text-sm text-slate-400">
          Loading learner insights...
        </div>
      ) : total === 0 ? (
        <div className="flex h-52 flex-col items-center justify-center text-center">
          <Users size={30} className="text-slate-300" />

          <p className="mt-3 text-sm font-medium text-slate-600">
            No learner accounts to analyse
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Status insights will appear when learners are available.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-5 py-5 sm:flex-row sm:justify-around">
            <div className="relative h-40 w-40 shrink-0">
              <svg
                viewBox="0 0 120 120"
                className="h-full w-full -rotate-90"
                role="img"
                aria-label={`Learner status: ${active} active and ${inactive} inactive`}
              >
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="13"
                />

                {active > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="13"
                    strokeDasharray={`${activeLength} ${circumference}`}
                    strokeLinecap="round"
                  />
                )}

                {inactive > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="13"
                    strokeDasharray={`${inactiveLength} ${circumference}`}
                    strokeDashoffset={-activeLength}
                    strokeLinecap="round"
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#17233F]">
                  {formatNumber(total)}
                </span>

                <span className="mt-1 text-xs text-slate-500">
                  Learners
                </span>
              </div>
            </div>

            <div className="w-full max-w-xs divide-y divide-slate-100">
              <LegendItem
                color="bg-emerald-500"
                label="Active"
                value={active}
                percentage={Math.round(activePercentage)}
              />

              <LegendItem
                color="bg-rose-500"
                label="Inactive"
                value={inactive}
                percentage={Math.round(inactivePercentage)}
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-500">
                Active account rate
              </span>

              <span className="text-sm font-bold text-emerald-700">
                {Math.round(activePercentage)}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-rose-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${activePercentage}%` }}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function ProfileInsights({ complete, needsAttention, loading }) {
  const total = complete + needsAttention;

  const completePercentage = total
    ? Math.round((complete / total) * 100)
    : 0;

  const incompletePercentage = 100 - completePercentage;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <SectionHeader
        title="Profile information"
        description="Learners with a date of birth and a bio provided"
        icon={CircleUserRound}
      />

      {loading ? (
        <div className="flex h-52 items-center justify-center text-sm text-slate-400">
          Loading profile insights...
        </div>
      ) : total === 0 ? (
        <div className="flex h-52 flex-col items-center justify-center text-center">
          <CircleUserRound size={30} className="text-slate-300" />

          <p className="mt-3 text-sm font-medium text-slate-600">
            No profile data available
          </p>
        </div>
      ) : (
        <>
          <div className="mt-7">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">
                  Information completeness
                </p>

                <p className="mt-2 text-4xl font-bold tracking-tight text-[#17233F]">
                  {completePercentage}%
                </p>
              </div>

              <span className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <UserRound size={23} />
              </span>
            </div>

            <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-indigo-500 transition-all"
                style={{ width: `${completePercentage}%` }}
              />

              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${incompletePercentage}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Both fields present</span>
              <span>{formatNumber(total)} profiles checked</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <CheckCircle2 size={17} />
                </span>

                <span className="text-sm text-slate-600">
                  Both fields provided
                </span>
              </div>

              <span className="font-bold text-[#17233F]">
                {formatNumber(complete)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-amber-50 p-2 text-amber-600">
                  <AlertCircle size={17} />
                </span>

                <span className="text-sm text-slate-600">
                  Missing one or both fields
                </span>
              </div>

              <span className="font-bold text-[#17233F]">
                {formatNumber(needsAttention)}
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-400">
            This indicator checks only date of birth and bio. It does not
            represent every possible profile requirement.
          </p>
        </>
      )}
    </section>
  );
}

function InsightRow({ icon: Icon, title, description, value, tone }) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <div className={`rounded-xl p-2.5 ${tone}`}>
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#17233F]">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <span className="shrink-0 text-lg font-bold text-[#17233F]">
        {value}
      </span>
    </div>
  );
}

function LearningResourceOverview({ dashboard, loading }) {
  const resources = [
    {
      label: "Published courses",
      value: dashboard.publishedCourses,
      icon: BookOpen,
      color: "text-emerald-600",
      background: "bg-emerald-50",
      bar: "bg-emerald-500",
    },
    {
      label: "Available skills",
      value: dashboard.availableSkills,
      icon: Brain,
      color: "text-violet-600",
      background: "bg-violet-50",
      bar: "bg-violet-500",
    },
    {
      label: "Active assessments",
      value: dashboard.activeAssessments,
      icon: ClipboardCheck,
      color: "text-amber-600",
      background: "bg-amber-50",
      bar: "bg-amber-500",
    },
  ];

  const maximum = Math.max(
    ...resources.map((resource) => Number(resource.value) || 0),
    1
  );

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <SectionHeader
        title="Learning resources overview"
        description="Compare the current counts of courses, skills, and assessments"
        icon={Sparkles}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          Loading resource information...
        </div>
      ) : (
        <div className="mt-7 space-y-6">
          {resources.map((resource) => {
            const Icon = resource.icon;
            const value = Number(resource.value) || 0;
            const percentage = (value / maximum) * 100;

            return (
              <div key={resource.label}>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-xl p-2.5 ${resource.background} ${resource.color}`}
                  >
                    <Icon size={19} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#17233F]">
                      {resource.label}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatNumber(value)} available
                    </p>
                  </div>

                  <span className="text-lg font-bold text-[#17233F]">
                    {formatNumber(value)}
                  </span>
                </div>

                <div className="ml-12 mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${resource.bar}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-7 flex items-start gap-2 rounded-xl bg-indigo-50/70 p-3.5 text-xs leading-5 text-indigo-800">
        <Info size={16} className="mt-0.5 shrink-0" />

        <p>
          These bars compare resource counts. They are not performance scores
          or percentages of course completion.
        </p>
      </div>
    </section>
  );
}

function WorkspaceHealth({ dashboard, insights, loading }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <SectionHeader
        title="Workspace health"
        description="A compact summary of learner and resource data"
        icon={Activity}
      />

      <div className="mt-4 divide-y divide-slate-100">
        <InsightRow
          icon={CheckCircle2}
          title="Active learner accounts"
          description="Accounts currently enabled"
          value={loading ? "—" : formatNumber(insights.active)}
          tone="bg-emerald-50 text-emerald-600"
        />

        <InsightRow
          icon={XCircle}
          title="Inactive learner accounts"
          description="Accounts currently disabled"
          value={loading ? "—" : formatNumber(insights.inactive)}
          tone="bg-rose-50 text-rose-600"
        />

        <InsightRow
          icon={CircleUserRound}
          title="Profiles needing attention"
          description="Missing date of birth or bio"
          value={loading ? "—" : formatNumber(insights.needsAttention)}
          tone="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <GraduationCap
            size={19}
            className="mt-0.5 shrink-0 text-indigo-600"
          />

          <div>
            <p className="text-sm font-semibold text-[#17233F]">
              Learning workspace
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {loading
                ? "Checking learning resources..."
                : dashboard.publishedCourses > 0
                  ? "Published courses are available in the current dashboard data."
                  : "No published courses were reported by the dashboard API."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchDashboard();

      setDashboard({
        totalLearners: data.totalLearners ?? 0,
        availableSkills: data.availableSkills ?? 0,
        publishedCourses: data.publishedCourses ?? 0,
        activeAssessments: data.activeAssessments ?? 0,
        learners: Array.isArray(data.learners) ? data.learners : [],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const learnerInsights = useMemo(() => {
    const learners = dashboard.learners;

    const active = learners.filter(
      (learner) => learner.isActive === true
    ).length;

    const inactive = learners.length - active;

    const completeProfiles = learners.filter(
      (learner) =>
        Boolean(learner.bio?.trim()) &&
        Boolean(learner.dateOfBirth)
    ).length;

    return {
      active,
      inactive,
      completeProfiles,
      needsAttention: learners.length - completeProfiles,
    };
  }, [dashboard.learners]);

  return (
    <DashboardLayout role="Admin" title="Admin Dashboard">
      <main className="min-h-full bg-[#F6F8FC] px-1 pb-6">
        {/* Page heading */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              <ShieldCheck size={15} />
              Organization workspace
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#17233F] sm:text-3xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Monitor learning resources, learner account health, and
              workspace readiness.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#17233F] shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />

            {loading ? "Refreshing..." : "Refresh data"}
          </button>
        </div>

        {/* API error */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"
          >
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-rose-600"
            />

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-rose-800">
                Dashboard data could not be loaded
              </p>

              <p className="mt-1 break-words text-sm leading-6 text-rose-700">
                {error}
              </p>

              <button
                type="button"
                onClick={loadDashboard}
                className="mt-2 text-sm font-semibold text-rose-800 underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* KPI cards */}
        <section
          aria-label="Organization overview statistics"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {statConfig.map((stat) => (
            <StatCard
              key={stat.key}
              stat={stat}
              value={dashboard[stat.key]}
              loading={loading}
            />
          ))}
        </section>

        {/* Learner charts */}
        <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <LearnerStatusChart
            active={learnerInsights.active}
            inactive={learnerInsights.inactive}
            loading={loading}
          />

          <ProfileInsights
            complete={learnerInsights.completeProfiles}
            needsAttention={learnerInsights.needsAttention}
            loading={loading}
          />
        </section>

        {/* Resource analytics and workspace health */}
        <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <LearningResourceOverview
            dashboard={dashboard}
            loading={loading}
          />

          <WorkspaceHealth
            dashboard={dashboard}
            insights={learnerInsights}
            loading={loading}
          />
        </section>

        {/* Footer */}
        <footer className="mt-7 flex flex-wrap items-center justify-center gap-2 pb-2 text-xs text-slate-400">
          <span>SkillMesh</span>
          <span>·</span>
          <span>Admin workspace</span>
          <span>·</span>
          <span>Organization insights</span>
        </footer>
      </main>
    </DashboardLayout>
  );
}
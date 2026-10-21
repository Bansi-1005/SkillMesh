import { useEffect, useState } from "react";
import {
  Users,
  Brain,
  BookOpen,
  ClipboardCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5182"
).replace(/\/+$/, "");

const initialStats = [
  {
    label: "Total Learners",
    icon: Users,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    label: "Available Skills",
    icon: Brain,
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "Published Courses",
    icon: BookOpen,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Active Assessments",
    icon: ClipboardCheck,
    color: "bg-amber-50 text-amber-600",
  },
];

async function fetchApi(endpoint) {
  const response = await fetch(`${API_BASE_URL}/api/${endpoint}`);

  if (!response.ok) {
    throw new Error(`${endpoint} API failed with status ${response.status}`);
  }

  return response.json();
}

function getValue(item, ...keys) {
  for (const key of keys) {
    const match = Object.keys(item || {}).find(
      (itemKey) => itemKey.toLowerCase() === key.toLowerCase(),
    );

    if (match && item[match] != null) {
      return item[match];
    }
  }

  return "";
}

function getArray(data) {
  if (Array.isArray(data)) return data;

  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.items)) return data.items;

  return [];
}

export default function AdminDashboard() {
  const [learners, setLearners] = useState([]);
  const [skills, setSkills] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  async function loadDashboard() {
    setLoading(true);
    setErrors([]);

    const endpoints = [
      {
        name: "Learner profiles",
        endpoint: "LearnerProfile",
        setter: setLearners,
      },
      {
        name: "Skills",
        endpoint: "Skill",
        setter: setSkills,
      },
      {
        name: "Courses",
        endpoint: "Course",
        setter: setCourses,
      },
      {
        name: "Assessments",
        endpoint: "Assessment",
        setter: setAssessments,
      },
    ];

    const results = await Promise.all(
      endpoints.map(async (item) => {
        try {
          const data = await fetchApi(item.endpoint);
          item.setter(getArray(data));
          return null;
        } catch (error) {
          return `${item.name}: ${error.message}`;
        }
      }),
    );

    setErrors(results.filter(Boolean));
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const publishedCourses = courses.filter(
    (course) =>
      getValue(course, "isPublished", "published") === true ||
      getValue(course, "isPublished", "published") === 1,
  ).length;

  const activeAssessments = assessments.filter(
    (assessment) =>
      getValue(assessment, "isActive", "active") === true ||
      getValue(assessment, "isActive", "active") === 1,
  ).length;

  const stats = [
    {
      ...initialStats[0],
      value: learners.length,
      note: "Registered learner profiles",
    },
    {
      ...initialStats[1],
      value: skills.length,
      note: "Skills in the platform",
    },
    {
      ...initialStats[2],
      value: publishedCourses,
      note: "Courses available to learners",
    },
    {
      ...initialStats[3],
      value: activeAssessments,
      note: "Currently active assessments",
    },
  ];

  return (
    <DashboardLayout role="Admin" title="Admin Dashboard">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17233F] sm:text-3xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Monitor learners and manage your learning platform.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#17233F] shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 font-semibold text-amber-800">
            <AlertCircle size={18} />
            Some dashboard data could not be loaded
          </div>

          <ul className="mt-2 list-inside list-disc text-sm text-amber-800">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>

          <p className="mt-2 text-sm text-amber-800">
            Check that your API is running and its URLs are correct.
          </p>
        </div>
      )}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>

              <span className={`rounded-xl p-2.5 ${color}`}>
                <Icon size={20} />
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[#17233F]">
              {loading ? "—" : value}
            </p>

            <p className="mt-2 text-xs text-slate-500">{note}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h2 className="text-lg font-bold text-[#17233F]">Learner Profiles</h2>

          <p className="mt-1 text-sm text-slate-500">
            View registered learners and their profile information.
          </p>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-slate-500">
            Loading learner profiles...
          </p>
        ) : learners.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            No learner profiles found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Learner ID</th>
                  <th className="px-6 py-4 font-semibold">Learner</th>
                  <th className="px-6 py-4 font-semibold">Date of Birth</th>
                  <th className="px-6 py-4 font-semibold">Profile Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {learners.map((learner, index) => {
                  const learnerId = getValue(learner, "learnerId", "userId");

                  const name = [
                    getValue(learner, "firstName"),
                    getValue(learner, "lastName"),
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <tr
                      key={learnerId || index}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 text-slate-500">
                        {learnerId || "—"}
                      </td>

                      <td className="px-6 py-4 font-medium text-[#17233F]">
                        {name ||
                          getValue(learner, "name", "fullName") ||
                          "Learner"}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {getValue(learner, "dateOfBirth") || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600">
                          {getValue(learner, "bio")
                            ? "Profile available"
                            : "Registered"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && learners.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
            Total learner profiles: {learners.length}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

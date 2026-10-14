import { ArrowRight, BookOpen, Flame, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

const stats = [
  {
    title: "Skills on Track",
    value: "12",
    note: "+2 this month",
    icon: TrendingUp,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    title: "Skill Gaps",
    value: "5",
    note: "2 high priority",
    icon: Target,
    color: "text-amber-600 bg-amber-50",
  },
  {
    title: "Learning Streak",
    value: "7 days",
    note: "Keep it going",
    icon: Flame,
    color: "text-orange-600 bg-orange-50",
  },
  {
    title: "Path Completion",
    value: "34%",
    note: "4 of 12 activities",
    icon: BookOpen,
    color: "text-purple-600 bg-purple-50",
  },
];

const gaps = [
  { name: "React.js", current: 3, target: 5, priority: "High" },
  { name: "SQL Server", current: 2, target: 4, priority: "High" },
  { name: "ASP.NET Core", current: 3, target: 4, priority: "Medium" },
];

const courses = [
  {
    name: "Advanced React Development",
    lessons: "8 lessons · Intermediate",
    progress: 65,
  },
  {
    name: "SQL Server Fundamentals",
    lessons: "6 lessons · Beginner",
    progress: 30,
  },
  {
    name: "REST API Development",
    lessons: "10 lessons · Intermediate",
    progress: 20,
  },
];

export default function LearnerDashboard() {
  return (
    <DashboardLayout role="Learner">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-500">Monday, October 12, 2026</p>
          <h1 className="mt-2 text-3xl font-bold text-[#17233F]">
            Good morning, Ayesha
          </h1>
          <p className="mt-2 text-slate-500">
            A focused view of your skills, goals, and next steps.
          </p>
        </div>
        <Link
          to="/learner/courses"
          className="rounded-xl bg-[#5540F5] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[#4430DF]"
        >
          + Explore learning
        </Link>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Your target role
        </p>
        <div className="mt-4 grid gap-7 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#17233F]">
              Frontend Developer
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Your profile matches <b className="text-[#5540F5]">68%</b> of the
              required skills.
            </p>
            <Link
              to="/learner/gaps"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#5540F5]"
            >
              View skill analysis <ArrowRight size={16} />
            </Link>
          </div>
          <div>
            <div className="flex justify-between text-sm font-semibold text-slate-600">
              <span>Role readiness</span>
              <span>68%</span>
            </div>
            <div className="mt-3 h-3 rounded-full bg-slate-100">
              <div className="h-3 w-[68%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            </div>
            <div className="mt-3 flex justify-between text-xs text-slate-400">
              <span>Getting started</span>
              <span>Career-ready</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, note, icon: Icon, color }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase text-slate-400">
                {title}
              </p>
              <span className={`rounded-lg p-2 ${color}`}>
                <Icon size={18} />
              </span>
            </div>
            <p className="mt-5 text-3xl font-bold text-[#17233F]">{value}</p>
            <span
              className={`mt-3 inline-block rounded-full px-3 py-1 text-xs ${color}`}
            >
              {note}
            </span>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#17233F]">
              Priority skill gaps
            </h2>
            <Link
              to="/learner/gaps"
              className="text-sm font-semibold text-[#5540F5]"
            >
              See all →
            </Link>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Focus on skills that will move you closer to your target role.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Skill</th>
                  <th className="pb-3">Current</th>
                  <th className="pb-3">Target</th>
                  <th className="pb-3">Priority</th>
                </tr>
              </thead>
              <tbody>
                {gaps.map((gap) => (
                  <tr key={gap.name} className="border-b border-slate-50">
                    <td className="py-4 font-semibold text-slate-700">
                      {gap.name}
                    </td>
                    <td className="py-4 text-slate-500">{gap.current}/5</td>
                    <td className="py-4 text-slate-500">{gap.target}/5</td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${gap.priority === "High" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}
                      >
                        {gap.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-bold text-[#17233F]">Recommended next</h2>
          <p className="mt-1 text-sm text-slate-500">
            Selected for your current skill gaps.
          </p>
          <div className="mt-5 space-y-4">
            {courses.map((course) => (
              <div key={course.name} className="rounded-xl bg-[#F7F5FF] p-4">
                <h3 className="text-sm font-semibold text-[#17233F]">
                  {course.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500">{course.lessons}</p>
                <div className="mt-3 h-1.5 rounded-full bg-white">
                  <div
                    className="h-1.5 rounded-full bg-[#5540F5]"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <p className="mt-2 text-right text-xs text-slate-500">
                  {course.progress}% complete
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

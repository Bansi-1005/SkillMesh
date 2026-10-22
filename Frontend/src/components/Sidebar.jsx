
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Network,
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  BookOpen,
  BriefcaseBusiness,
  Target,
  Route,
  FolderKanban,
  ClipboardCheck,
  ChartNoAxesCombined,
  GraduationCap,
  LogOut,
  Brain,
  Tags,
  GitBranch,
  FileText,
  UserRound,
  Library,
  BarChart3,
  UserCog,
  BookMarked,
} from "lucide-react";

const menus = {
  Learner: [
    ["Dashboard", "/learner", LayoutDashboard],
    ["My Profile", "/learner/profile", UserRound],
    ["My Skills", "/learner/skills", Brain],
    ["Career Goals", "/learner/career-goals", BriefcaseBusiness],
    ["Skill Assessments", "/learner/assessments", ClipboardCheck],
    ["Skill Gap Analysis", "/learner/gaps", Target],
    ["Learning Paths", "/learner/paths", Route],
    ["Courses", "/learner/courses", BookOpen],
    ["Learning Resources", "/learner/resources", Library],
    ["Projects", "/learner/projects", FolderKanban],
    ["My Progress", "/learner/progress", ChartNoAxesCombined],
    ["My Reports", "/learner/reports", FileText],
  ],

  Admin: [
    ["Dashboard", "/admin", LayoutDashboard],
    ["Organization", "/admin/organization", Building2],
    ["Learner Management", "/admin/users", Users],
    ["Learner Profiles", "/admin/learner-profiles", UserRound],
    ["Skills", "/admin/skills", Brain],
    ["Job Roles", "/admin/job-roles", BriefcaseBusiness],
    ["Assessments", "/admin/assessments", ClipboardCheck],
    ["Assessment Questions", "/admin/assessment-questions", BookMarked],
    ["Learning Content", "/admin/learning-content", Library],
    ["Course Management", "/admin/courses", BookOpen],
    ["Skill Gap Analysis", "/admin/skill-gaps", Target],
    ["Learning Paths", "/admin/learning-paths", Route],
    ["Project Management", "/admin/projects", FolderKanban],
    ["Learner Progress", "/admin/progress", ChartNoAxesCombined],
    ["Reports & Analytics", "/admin/reports", BarChart3],
  ],

  "Super Admin": [
    ["Dashboard", "/superadmin", LayoutDashboard],
    ["Organizations Management", "/superadmin/organizations", Building2],
    ["User Management", "/superadmin/users", Users],
    ["Roles & Access", "/superadmin/roles", ShieldCheck],
    ["Skill Categories", "/superadmin/skill-categories", Tags],
    ["Skill Management", "/superadmin/skills", Brain],
    ["Skill Levels", "/superadmin/skill-levels", GraduationCap],
    ["Skill Relationships", "/superadmin/skill-relationships", GitBranch],
    ["Job Role Management", "/superadmin/job-roles", BriefcaseBusiness],
    ["Job Role Skills", "/superadmin/job-role-skills", Target],
    ["Analytics & Reports", "/superadmin/analytics", ChartNoAxesCombined],
  ],
};

export default function Sidebar({ role = "Learner" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const normalizedRole = String(role)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  const pathname = location.pathname.toLowerCase();

  const roleKey = pathname.startsWith("/superadmin")
    ? "Super Admin"
    : pathname.startsWith("/admin")
      ? "Admin"
      : pathname.startsWith("/learner")
        ? "Learner"
        : normalizedRole === "superadmin"
          ? "Super Admin"
          : normalizedRole === "admin"
            ? "Admin"
            : "Learner";

  const items = menus[roleKey];

  const dashboardPaths = {
    Learner: "/learner",
    Admin: "/admin",
    "Super Admin": "/superadmin",
  };

  const dashboardPath = dashboardPaths[roleKey];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#111D3A] text-white">
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-6">
        <div className="rounded-xl bg-[#5540F5] p-2.5">
          <Network size={24} />
        </div>
        <span className="text-xl font-bold">SkillMesh</span>
      </div>

      <p className="px-6 pb-3 pt-8 text-[10px] font-bold uppercase tracking-[2px] text-slate-400">
        {roleKey} Workspace
      </p>

      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide px-3 pb-4">
        {items.map(([label, path, Icon]) => (
          <NavLink
            key={path}
            to={path}
            end={path === dashboardPath}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-[#293B60] font-semibold text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="m-3 shrink-0 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold">Need help?</p>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Welcome to the SkillMesh learning workspace.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate("/login")}
        className="flex shrink-0 items-center gap-3 border-t border-white/10 px-6 py-4 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
      >
        <LogOut size={18} />
        Back to Login
      </button>
    </aside>
  );
}

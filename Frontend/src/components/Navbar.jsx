import { Bell, ChevronDown } from "lucide-react";

const demoUsers = {
  Learner: { name: "Ayesha Patel", initials: "AP" },
  Admin: { name: "Rahul Shah", initials: "RS" },
  "Super Admin": { name: "System Admin", initials: "SA" },
};

export default function Navbar({ role = "Learner", title = "Overview" }) {
  const user = demoUsers[role] || demoUsers.Learner;

  return (
    <header className="flex min-h-20 items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 sm:px-8">
      <div>
        <p className="text-xs text-slate-400">Workspace</p>
        <h2 className="mt-1 text-base font-semibold text-[#17233F]">{title}</h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <span className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 sm:block">
          {role}
        </span>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
        >
          <Bell size={20} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-pink-500" />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-100 pl-3 sm:pl-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E9E7FF] text-sm font-bold text-[#5540F5]">
            {user.initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[#17233F]">{user.name}</p>
            <p className="text-xs text-slate-500">{role}</p>
          </div>
          <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
        </div>
      </div>
    </header>
  );
}

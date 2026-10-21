import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, UserRound, Settings, LogOut } from "lucide-react";

export default function Navbar({ role = "Learner", title = "Overview" }) {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role,
  });

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function loadUser() {
      try {
        const savedUser = localStorage.getItem("skillmesh_user");
        const savedRole = localStorage.getItem("skillmesh_role");

        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);

          setUser({
            firstName: parsedUser.firstName ?? parsedUser.FirstName ?? "",
            lastName: parsedUser.lastName ?? parsedUser.LastName ?? "",
            email: parsedUser.email ?? parsedUser.Email ?? "",
            role: savedRole || parsedUser.role || parsedUser.Role || role,
          });
        } else {
          setUser({
            firstName: "",
            lastName: "",
            email: "",
            role: savedRole || role,
          });
        }
      } catch (error) {
        console.error("Unable to load logged-in user:", error);
      }
    }

    loadUser();
  }, [role]);

  const fullName =
    `${user.firstName} ${user.lastName}`.trim() || user.email || "User";

  const initials = fullName
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  function handleLogout() {
    localStorage.removeItem("skillmesh_token");
    localStorage.removeItem("skillmesh_role");
    localStorage.removeItem("skillmesh_user");

    navigate("/login", { replace: true });
  }

  return (
    <header className="flex min-h-20 items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 sm:px-8">
      {/* Page title */}
      <div>
        <p className="text-xs text-slate-400">Workspace</p>
        <h2 className="mt-1 text-base font-semibold text-[#17233F]">{title}</h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* <span className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 sm:block">
          {user.role}
        </span> */}

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
        >
          <Bell size={20} />
        </button>

        {/* User profile and dropdown */}
        <div className="relative border-l border-slate-100 pl-3 sm:pl-5">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Open user menu"
            className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E9E7FF] text-sm font-bold text-[#5540F5]">
              {initials || "U"}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-40 truncate text-sm font-semibold text-[#17233F]">
                {fullName}
              </p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>

            <ChevronDown
              size={15}
              className={`hidden text-slate-400 transition sm:block ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
              <div className="border-b border-slate-100 px-4 py-4">
                <p className="truncate text-sm font-semibold text-[#17233F]">
                  {fullName}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {user.email || "Email not available"}
                </p>
                <p className="mt-2 inline-block rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600">
                  {user.role}
                </p>
              </div>

              <div className="p-2">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <UserRound size={17} />
                  My Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Settings size={17} />
                  Settings
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

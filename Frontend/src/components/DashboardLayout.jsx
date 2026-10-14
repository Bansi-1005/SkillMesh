import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({
  role = "Learner",
  title = "Overview",
  children,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      <div className="hidden lg:block">
        <Sidebar role={role} />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close sidebar"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative h-full w-64">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-5 z-50 text-white"
            >
              <X size={22} />
            </button>
            <Sidebar role={role} />
          </div>
        </div>
      )}

      <div className="min-h-screen lg:ml-64">
        <div className="hidden lg:block">
          <Navbar role={role} title={title} />
        </div>

        <div className="flex items-center bg-white lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="ml-3 p-2"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="min-w-0 flex-1">
            <Navbar role={role} title={title} />
          </div>
        </div>

        <main className="p-5 sm:p-8">{children || <Outlet />}</main>
      </div>
    </div>
  );
}

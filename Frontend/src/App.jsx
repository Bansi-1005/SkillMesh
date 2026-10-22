import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardLayout from "./components/DashboardLayout";

import LearnerDashboard from "./pages/learner/LearnerDashboard";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Organization from "./pages/admin/Organization";

import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SkillCategory from "./pages/superadmin/SkillCategory";
import Skill from "./pages/superadmin/Skill";
import SkillLevel from "./pages/superadmin/SkillLevel";
import SkillRelationship from "./pages/superadmin/SkillRelationship";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default and Authentication Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Learner Routes */}
        <Route path="/learner" element={<LearnerDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/admin/organization"
          element={<Organization role="Admin" />}
        />
        <Route path="/admin/skills" element={<Skill role="Admin" />} />
        <Route
          path="/admin/skill-levels"
          element={<SkillLevel role="Admin" />}
        />
        <Route
          path="/admin/skill-relationships"
          element={<SkillRelationship role="Admin" />}
        />

        {/* Super Admin Routes */}
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route
          path="/superadmin/organizations"
          element={<Organization role="Super Admin" />}
        />
        <Route
          path="/superadmin/skill-categories"
          element={<SkillCategory />}
        />
        <Route path="/superadmin/skills" element={<Skill />} />
        <Route
          path="/superadmin/skill-levels"
          element={<SkillLevel role="Super Admin" />}
        />
        <Route
          path="/superadmin/skill-relationships"
          element={<SkillRelationship role="Super Admin" />}
        />

        {/* Unknown Routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardLayout from "./components/DashboardLayout";

import LearnerDashboard from "./pages/learner/LearnerDashboard";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Organization from "./pages/admin/Organization";

import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/learner" element={<LearnerDashboard />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/admin/organization"
          element={<Organization role="Admin" />}
        />

        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route
          path="/superadmin/organizations"
          element={<Organization role="Super Admin" />}
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
// import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";
// import LearnerDashboard from "./pages/learner/LearnerDashboard";
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Navigate to="/login" replace />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/learner/*" element={<LearnerDashboard />} />
//         <Route path="/admin/*" element={<AdminDashboard />} />
//         <Route path="/superadmin/*" element={<SuperAdminDashboard />} />
//         <Route path="*" element={<Navigate to="/login" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// import Skills from "./pages/skills/Skills";
// import DatabaseTest from "./DatabaseTest";

// function App() {
//   return (
//     <>
//       <DatabaseTest />
//       <Skills />
//     </>
//   );
// }

// export default App;

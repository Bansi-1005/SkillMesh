// import { Navigate } from "react-router-dom";

// function ProtectedRoute({ children, allowedRole }) {
//   const user = JSON.parse(localStorage.getItem("skillmeshUser") || "null");

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (user.role !== allowedRole) {
//     const routes = {
//       Learner: "/learner",
//       Admin: "/admin",
//       "Super Admin": "/superadmin",
//     };

//     return <Navigate to={routes[user.role] || "/login"} replace />;
//   }

//   return children;
// }

// export default ProtectedRoute;


import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("skillmesh_user") ||
        localStorage.getItem("skillmeshUser") ||
        "null",
    );
  } catch {
    user = null;
  }

  // The user must be logged in.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role names to handle differences in capitalization.
  const normalizeRole = (role) =>
    String(role || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]/g, "");

  const userRole = normalizeRole(user.role);

  const allowed = allowedRoles.some(
    (role) => normalizeRole(role) === userRole
  );

  // Redirect users whose roles are not allowed.
  if (!allowed) {
    const routes = {
      learner: "/learner",
      admin: "/admin",
      superadmin: "/superadmin",
    };

    return (
      <Navigate
        to={routes[userRole] || "/login"}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;

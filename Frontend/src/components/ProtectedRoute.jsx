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

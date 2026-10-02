import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Usage: <ProtectedRoute role="customer"> or role={["admin","staff"]}
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && !(Array.isArray(role) ? role.includes(user.role) : user.role === role)) {
    return <Navigate to={user.role === "customer" ? "/services" : "/admin"} replace />;
  }
  return children;
}

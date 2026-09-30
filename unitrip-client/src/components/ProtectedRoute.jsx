import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="container-page py-12">Loading…</div>;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export function RequireAdmin({ children }) {
  const { isAdmin, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  if (loading) return <div className="container-page py-12">Loading…</div>;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

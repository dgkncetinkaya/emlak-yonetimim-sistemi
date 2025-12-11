import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../context/AuthContext';

export default function RoleProtectedRoute({ allowed }: { allowed: Role[] }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user && !allowed.includes(user.role)) {
    // Not authorized for this route
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
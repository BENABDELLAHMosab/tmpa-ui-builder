import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { UserRole } from '../types/auth';
import { getAccessToken, getAuthUser, getDashboardPathByRole } from '../utils/authStorage';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const token = getAccessToken();
  const user = getAuthUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPathByRole(user.role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

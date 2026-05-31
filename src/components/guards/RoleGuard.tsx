/**
 * Role Guard Component
 * ----------------------
 * Protects routes based on user roles.
 * Redirects to unauthorized page if role doesn't match.
 */

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { ROUTES } from '../../config/routes';
import type { UserRole } from '../../config/constants';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback = ROUTES.UNAUTHORIZED,
}: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

/**
 * Guest Guard Component
 * -----------------------
 * Redirects authenticated users away from auth pages (login, register).
 */

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { DEFAULT_ROUTE_BY_ROLE } from '../../config/routes';

interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, user, isLoading, isInitialized } =
    useAuthStore();

  if (!isInitialized || isLoading) {
    return null; // Will be replaced with premium loading screen
  }

  if (isAuthenticated && user) {
    const redirectTo = DEFAULT_ROUTE_BY_ROLE[user.role];
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

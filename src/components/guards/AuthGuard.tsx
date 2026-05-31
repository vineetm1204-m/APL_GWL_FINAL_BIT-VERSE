/**
 * Auth Guard Component
 * ----------------------
 * Protects routes that require authentication.
 * Redirects to login if not authenticated.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { ROUTES } from '../../config/routes';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const location = useLocation();

  // Still loading auth state
  if (!isInitialized || isLoading) {
    return null; // Will be replaced with premium loading screen
  }

  // Not authenticated — redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }

  return <>{children}</>;
}

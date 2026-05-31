/**
 * Application Router
 * --------------------
 * Defines all routes with lazy-loaded pages, auth guards, and role guards.
 * Uses React Router v6 with suspense boundaries.
 */

import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { ROLES } from '../config/constants';
import { AuthGuard } from '../components/guards/AuthGuard';
import { RoleGuard } from '../components/guards/RoleGuard';
import { GuestGuard } from '../components/guards/GuestGuard';

// ─── Lazy-loaded Pages ──────────────────────────────────────────────
// Pages will be created in Phase 2. For now, placeholder components exist.

const LandingPage = lazy(() => import('../features/landing/LandingPage'));
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../features/auth/ForgotPasswordPage'));

// Citizen
const CitizenDashboard = lazy(() => import('../features/dashboard/CitizenDashboard'));
const SubmitGrievance = lazy(() => import('../features/grievances/SubmitGrievance'));
const MyGrievances = lazy(() => import('../features/grievances/MyGrievances'));
const GrievanceDetail = lazy(() => import('../features/grievances/GrievanceDetail'));
const CityMap = lazy(() => import('../features/map/CityMap'));
const ProfilePage = lazy(() => import('../features/profile/ProfilePage'));
const NotificationsPage = lazy(() => import('../features/notifications/NotificationsPage'));

// Officer
const OfficerDashboard = lazy(() => import('../features/officer/OfficerDashboard'));
const OfficerQueue = lazy(() => import('../features/officer/OfficerQueue'));

// Admin
const AdminDashboard = lazy(() => import('../features/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../features/admin/AdminUsers'));
const AdminIssues = lazy(() => import('../features/admin/AdminIssues'));
const AdminWards = lazy(() => import('../features/admin/AdminWards'));
const AdminEscalations = lazy(() => import('../features/admin/AdminEscalations'));
const AdminAnalytics = lazy(() => import('../features/admin/AdminAnalytics'));
const AdminNotifications = lazy(() => import('../features/admin/AdminNotifications'));
const AdminAuditLog = lazy(() => import('../features/admin/AdminAuditLog'));
const AdminSettings = lazy(() => import('../features/admin/AdminSettings'));
const AdminWardImport = lazy(() => import('../features/admin/AdminWardImport'));

// Layouts
const AppLayout = lazy(() => import('../components/layout/AppLayout'));

// Error
const NotFoundPage = lazy(() => import('../features/errors/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../features/errors/UnauthorizedPage'));

// ─── Loading Fallback ────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm font-medium tracking-wide">
          Loading...
        </p>
      </div>
    </div>
  );
}

// ─── Router Configuration ────────────────────────────────────────────

const router = createBrowserRouter([
  // Public routes
  {
    path: ROUTES.HOME,
    element: (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <GuestGuard>
        <Suspense fallback={<PageLoader />}>
          <LoginPage />
        </Suspense>
      </GuestGuard>
    ),
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <GuestGuard>
        <Suspense fallback={<PageLoader />}>
          <RegisterPage />
        </Suspense>
      </GuestGuard>
    ),
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: (
      <GuestGuard>
        <Suspense fallback={<PageLoader />}>
          <ForgotPasswordPage />
        </Suspense>
      </GuestGuard>
    ),
  },

  // Authenticated routes (wrapped in AppLayout)
  {
    element: (
      <AuthGuard>
        <Suspense fallback={<PageLoader />}>
          <AppLayout>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </AppLayout>
        </Suspense>
      </AuthGuard>
    ),
    children: [
      // Citizen routes
      {
        path: ROUTES.DASHBOARD,
        element: <CitizenDashboard />,
      },
      {
        path: ROUTES.SUBMIT_GRIEVANCE,
        element: <SubmitGrievance />,
      },
      {
        path: ROUTES.MY_GRIEVANCES,
        element: <MyGrievances />,
      },
      {
        path: ROUTES.GRIEVANCE_DETAIL,
        element: <GrievanceDetail />,
      },
      {
        path: ROUTES.CITY_MAP,
        element: <CityMap />,
      },
      {
        path: ROUTES.PROFILE,
        element: <ProfilePage />,
      },
      {
        path: ROUTES.NOTIFICATIONS,
        element: <NotificationsPage />,
      },

      // Officer routes
      {
        path: ROUTES.OFFICER_DASHBOARD,
        element: (
          <RoleGuard allowedRoles={[ROLES.WARD_OFFICER, ROLES.DEPARTMENT_HEAD]}>
            <OfficerDashboard />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.OFFICER_QUEUE,
        element: (
          <RoleGuard allowedRoles={[ROLES.WARD_OFFICER, ROLES.DEPARTMENT_HEAD]}>
            <OfficerQueue />
          </RoleGuard>
        ),
      },

      // Admin routes
      {
        path: ROUTES.ADMIN_DASHBOARD,
        element: (
          <RoleGuard allowedRoles={[ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN]}>
            <AdminDashboard />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.ADMIN_USERS,
        element: (
          <RoleGuard allowedRoles={[ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN]}>
            <AdminUsers />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.ADMIN_ISSUES,
        element: (
          <RoleGuard allowedRoles={[ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN]}>
            <AdminIssues />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.ADMIN_WARDS,
        element: (
          <RoleGuard allowedRoles={[ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN]}>
            <AdminWards />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.ADMIN_ESCALATIONS,
        element: (
          <RoleGuard allowedRoles={[ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN]}>
            <AdminEscalations />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.ADMIN_ANALYTICS,
        element: (
          <RoleGuard allowedRoles={[ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN]}>
            <AdminAnalytics />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.ADMIN_NOTIFICATIONS,
        element: (
          <RoleGuard allowedRoles={[ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN]}>
            <AdminNotifications />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.ADMIN_AUDIT_LOG,
        element: (
          <RoleGuard allowedRoles={[ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN]}>
            <AdminAuditLog />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.ADMIN_SETTINGS,
        element: (
          <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.CITY_ADMIN]}>
            <AdminSettings />
          </RoleGuard>
        ),
      },
      {
        path: ROUTES.ADMIN_WARD_IMPORT,
        element: (
          <RoleGuard allowedRoles={[ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN]}>
            <AdminWardImport />
          </RoleGuard>
        ),
      },
    ],
  },

  // Error routes
  {
    path: ROUTES.UNAUTHORIZED,
    element: (
      <Suspense fallback={<PageLoader />}>
        <UnauthorizedPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

// ─── Router Provider Component ──────────────────────────────────────

export function AppRouter() {
  return <RouterProvider router={router} />;
}

/**
 * Route Configuration
 * --------------------
 * Defines all application routes and their metadata.
 * Used by the router, navigation, breadcrumbs, and role-based guards.
 */

import { type UserRole, ROLES } from './constants';

// ─── Route Paths ─────────────────────────────────────────────────────

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Citizen routes
  DASHBOARD: '/dashboard',
  SUBMIT_GRIEVANCE: '/grievances/submit',
  MY_GRIEVANCES: '/grievances/my',
  GRIEVANCE_DETAIL: '/grievances/:grievanceId',
  GRIEVANCE_TRACK: '/grievances/:grievanceId/track',
  CITY_MAP: '/map',
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',

  // Officer routes
  OFFICER_DASHBOARD: '/officer/dashboard',
  OFFICER_QUEUE: '/officer/queue',
  OFFICER_GRIEVANCE: '/officer/grievances/:grievanceId',
  OFFICER_WARD_VIEW: '/officer/ward/:wardId',

  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_ISSUES: '/admin/issues',
  ADMIN_WARDS: '/admin/wards',
  ADMIN_ESCALATIONS: '/admin/escalations',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_AUDIT_LOG: '/admin/audit-log',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_WARD_IMPORT: '/admin/ward-import',

  // Error routes
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
} as const;

// ─── Route Metadata ──────────────────────────────────────────────────

export interface RouteMeta {
  path: string;
  title: string;
  description?: string;
  requiresAuth: boolean;
  allowedRoles: UserRole[] | 'all';
  showInNav: boolean;
  icon?: string;
  parent?: string;
}

export const ROUTE_META: Record<string, RouteMeta> = {
  [ROUTES.HOME]: {
    path: ROUTES.HOME,
    title: 'Home',
    requiresAuth: false,
    allowedRoles: 'all',
    showInNav: false,
  },
  [ROUTES.LOGIN]: {
    path: ROUTES.LOGIN,
    title: 'Sign In',
    requiresAuth: false,
    allowedRoles: 'all',
    showInNav: false,
  },
  [ROUTES.REGISTER]: {
    path: ROUTES.REGISTER,
    title: 'Create Account',
    requiresAuth: false,
    allowedRoles: 'all',
    showInNav: false,
  },
  [ROUTES.DASHBOARD]: {
    path: ROUTES.DASHBOARD,
    title: 'Dashboard',
    description: 'Your civic overview',
    requiresAuth: true,
    allowedRoles: [ROLES.CITIZEN],
    showInNav: true,
    icon: 'LayoutDashboard',
  },
  [ROUTES.SUBMIT_GRIEVANCE]: {
    path: ROUTES.SUBMIT_GRIEVANCE,
    title: 'Report Issue',
    description: 'Submit a new civic grievance',
    requiresAuth: true,
    allowedRoles: [ROLES.CITIZEN],
    showInNav: true,
    icon: 'PlusCircle',
  },
  [ROUTES.MY_GRIEVANCES]: {
    path: ROUTES.MY_GRIEVANCES,
    title: 'My Reports',
    description: 'Track your submitted grievances',
    requiresAuth: true,
    allowedRoles: [ROLES.CITIZEN],
    showInNav: true,
    icon: 'FileText',
  },
  [ROUTES.CITY_MAP]: {
    path: ROUTES.CITY_MAP,
    title: 'City Map',
    description: 'Live civic infrastructure map',
    requiresAuth: true,
    allowedRoles: 'all',
    showInNav: true,
    icon: 'Map',
  },
  [ROUTES.OFFICER_DASHBOARD]: {
    path: ROUTES.OFFICER_DASHBOARD,
    title: 'Officer Dashboard',
    description: 'Ward management overview',
    requiresAuth: true,
    allowedRoles: [ROLES.WARD_OFFICER, ROLES.DEPARTMENT_HEAD],
    showInNav: true,
    icon: 'Shield',
  },
  [ROUTES.OFFICER_QUEUE]: {
    path: ROUTES.OFFICER_QUEUE,
    title: 'Grievance Queue',
    description: 'Active grievances requiring attention',
    requiresAuth: true,
    allowedRoles: [ROLES.WARD_OFFICER, ROLES.DEPARTMENT_HEAD],
    showInNav: true,
    icon: 'Inbox',
  },
  [ROUTES.ADMIN_DASHBOARD]: {
    path: ROUTES.ADMIN_DASHBOARD,
    title: 'Admin Dashboard',
    description: 'City-wide administration',
    requiresAuth: true,
    allowedRoles: [ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN],
    showInNav: true,
    icon: 'LayoutDashboard',
  },
  [ROUTES.ADMIN_USERS]: {
    path: ROUTES.ADMIN_USERS,
    title: 'User Management',
    requiresAuth: true,
    allowedRoles: [ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN],
    showInNav: true,
    icon: 'Users',
  },
  [ROUTES.ADMIN_ISSUES]: {
    path: ROUTES.ADMIN_ISSUES,
    title: 'Issue Management',
    requiresAuth: true,
    allowedRoles: [ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN],
    showInNav: true,
    icon: 'AlertTriangle',
  },
  [ROUTES.ADMIN_WARDS]: {
    path: ROUTES.ADMIN_WARDS,
    title: 'Ward Management',
    requiresAuth: true,
    allowedRoles: [ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN],
    showInNav: true,
    icon: 'MapPin',
  },
  [ROUTES.ADMIN_ESCALATIONS]: {
    path: ROUTES.ADMIN_ESCALATIONS,
    title: 'Escalated Issues',
    requiresAuth: true,
    allowedRoles: [ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN],
    showInNav: true,
    icon: 'TrendingUp',
  },
  [ROUTES.ADMIN_ANALYTICS]: {
    path: ROUTES.ADMIN_ANALYTICS,
    title: 'Diagnostics',
    requiresAuth: true,
    allowedRoles: [ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN],
    showInNav: true,
    icon: 'BarChart3',
  },
  [ROUTES.ADMIN_NOTIFICATIONS]: {
    path: ROUTES.ADMIN_NOTIFICATIONS,
    title: 'Notifications Dispatch',
    requiresAuth: true,
    allowedRoles: [ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN],
    showInNav: true,
    icon: 'Bell',
  },
  [ROUTES.ADMIN_AUDIT_LOG]: {
    path: ROUTES.ADMIN_AUDIT_LOG,
    title: 'System Audit Logs',
    requiresAuth: true,
    allowedRoles: [ROLES.CITY_ADMIN, ROLES.SUPER_ADMIN],
    showInNav: true,
    icon: 'Activity',
  },
  [ROUTES.ADMIN_SETTINGS]: {
    path: ROUTES.ADMIN_SETTINGS,
    title: 'System Settings',
    requiresAuth: true,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.CITY_ADMIN],
    showInNav: true,
    icon: 'Settings',
  },
} as const;

// ─── Role → Default Route Mapping ───────────────────────────────────

export const DEFAULT_ROUTE_BY_ROLE: Record<UserRole, string> = {
  [ROLES.CITIZEN]: ROUTES.DASHBOARD,
  [ROLES.WARD_OFFICER]: ROUTES.OFFICER_DASHBOARD,
  [ROLES.DEPARTMENT_HEAD]: ROUTES.OFFICER_DASHBOARD,
  [ROLES.CITY_ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [ROLES.SUPER_ADMIN]: ROUTES.ADMIN_DASHBOARD,
};

// ─── Navigation Groups ──────────────────────────────────────────────

export const NAV_GROUPS = {
  citizen: [
    ROUTES.DASHBOARD,
    ROUTES.SUBMIT_GRIEVANCE,
    ROUTES.MY_GRIEVANCES,
    ROUTES.CITY_MAP,
  ],
  officer: [
    ROUTES.OFFICER_DASHBOARD,
    ROUTES.OFFICER_QUEUE,
    ROUTES.CITY_MAP,
  ],
  admin: [
    ROUTES.ADMIN_DASHBOARD,
    ROUTES.ADMIN_USERS,
    ROUTES.ADMIN_ISSUES,
    ROUTES.ADMIN_WARDS,
    ROUTES.ADMIN_ESCALATIONS,
    ROUTES.ADMIN_ANALYTICS,
    ROUTES.ADMIN_NOTIFICATIONS,
    ROUTES.ADMIN_AUDIT_LOG,
    ROUTES.ADMIN_SETTINGS,
  ],
} as const;

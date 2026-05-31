/**
 * Application Constants
 * ----------------------
 * Centralized constants for the GrievanceMap application.
 * No hardcoded wards, categories, or scores — all fetched from Firestore.
 */

// ─── Application Meta ────────────────────────────────────────────────

export const APP_NAME = 'GrievanceMap';
export const APP_TAGLINE = 'Built for the city. Accountable to its people.';
export const APP_DESCRIPTION =
  'A Civic Intelligence Platform that transforms citizen reports into actionable civic data.';
export const APP_VERSION = '1.0.0';

// ─── User Roles ──────────────────────────────────────────────────────

export const ROLES = {
  CITIZEN: 'citizen',
  WARD_OFFICER: 'ward_officer',
  DEPARTMENT_HEAD: 'department_head',
  CITY_ADMIN: 'city_admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// ─── Grievance Status Pipeline ───────────────────────────────────────

export const GRIEVANCE_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REJECTED: 'rejected',
  REOPENED: 'reopened',
} as const;

export type GrievanceStatus =
  (typeof GRIEVANCE_STATUS)[keyof typeof GRIEVANCE_STATUS];

// ─── Priority Levels ─────────────────────────────────────────────────

export const PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];

// ─── Notification Types ──────────────────────────────────────────────

export const NOTIFICATION_TYPES = {
  GRIEVANCE_UPDATE: 'grievance_update',
  ASSIGNMENT: 'assignment',
  COMMENT: 'comment',
  STATUS_CHANGE: 'status_change',
  SYSTEM: 'system',
  AI_INSIGHT: 'ai_insight',
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// ─── AI Model Configuration ─────────────────────────────────────────

export const AI_MODELS = {
  GEMINI_FLASH: 'gemini-2.0-flash',
  GEMINI_VISION: 'gemini-2.0-flash',
} as const;

// ─── Map Configuration ──────────────────────────────────────────────

export const MAP_CONFIG = {
  DEFAULT_CENTER: [20.5937, 78.9629] as [number, number], // India center, overridden by Firestore city config
  DEFAULT_ZOOM: 12,
  MIN_ZOOM: 8,
  MAX_ZOOM: 18,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  TILE_ATTRIBUTION:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
} as const;

// ─── Pagination ──────────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  ANALYTICS_PAGE_SIZE: 50,
} as const;

// ─── Storage Paths ───────────────────────────────────────────────────

export const STORAGE_PATHS = {
  GRIEVANCE_IMAGES: 'grievances/images',
  GRIEVANCE_DOCUMENTS: 'grievances/documents',
  USER_AVATARS: 'users/avatars',
  WARD_MAPS: 'wards/maps',
} as const;

// ─── Animation Durations ─────────────────────────────────────────────

export const ANIMATION = {
  FAST: 0.15,
  NORMAL: 0.3,
  SLOW: 0.5,
  PAGE_TRANSITION: 0.4,
  STAGGER_CHILDREN: 0.05,
} as const;

// ─── Breakpoints ─────────────────────────────────────────────────────

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

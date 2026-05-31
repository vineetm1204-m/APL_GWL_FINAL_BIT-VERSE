/**
 * Firestore Collection Architecture
 * -----------------------------------
 * Defines all Firestore collection paths and subcollection patterns.
 * This is the single source of truth for all database paths.
 *
 * COLLECTION HIERARCHY:
 *
 * users/{userId}
 *   ├── notifications/{notificationId}
 *   └── activity/{activityId}
 *
 * grievances/{grievanceId}
 *   ├── comments/{commentId}
 *   ├── timeline/{timelineId}
 *   └── attachments/{attachmentId}
 *
 * wards/{wardId}
 *   └── analytics/{analyticsId}
 *
 * categories/{categoryId}
 *
 * analytics/
 *   ├── city/{snapshotId}
 *   └── ward/{wardId}/snapshots/{snapshotId}
 *
 * ai_logs/{logId}
 *
 * system_config/{configId}
 */

// ─── Root Collections ────────────────────────────────────────────────

export const COLLECTIONS = {
  USERS: 'users',
  GRIEVANCES: 'grievances',
  WARDS: 'wards',
  CATEGORIES: 'categories',
  ANALYTICS: 'analytics',
  AI_LOGS: 'ai_logs',
  SYSTEM_CONFIG: 'system_config',
} as const;

// ─── Subcollections ──────────────────────────────────────────────────

export const SUBCOLLECTIONS = {
  // User subcollections
  USER_NOTIFICATIONS: 'notifications',
  USER_ACTIVITY: 'activity',

  // Grievance subcollections
  GRIEVANCE_COMMENTS: 'comments',
  GRIEVANCE_TIMELINE: 'timeline',
  GRIEVANCE_ATTACHMENTS: 'attachments',

  // Ward subcollections
  WARD_ANALYTICS: 'analytics',

  // Analytics subcollections
  CITY_SNAPSHOTS: 'city',
  WARD_SNAPSHOTS: 'snapshots',
} as const;

// ─── Path Builders ───────────────────────────────────────────────────

export const paths = {
  // User paths
  user: (userId: string) => `${COLLECTIONS.USERS}/${userId}`,
  userNotifications: (userId: string) =>
    `${COLLECTIONS.USERS}/${userId}/${SUBCOLLECTIONS.USER_NOTIFICATIONS}`,
  userActivity: (userId: string) =>
    `${COLLECTIONS.USERS}/${userId}/${SUBCOLLECTIONS.USER_ACTIVITY}`,

  // Grievance paths
  grievance: (grievanceId: string) =>
    `${COLLECTIONS.GRIEVANCES}/${grievanceId}`,
  grievanceComments: (grievanceId: string) =>
    `${COLLECTIONS.GRIEVANCES}/${grievanceId}/${SUBCOLLECTIONS.GRIEVANCE_COMMENTS}`,
  grievanceTimeline: (grievanceId: string) =>
    `${COLLECTIONS.GRIEVANCES}/${grievanceId}/${SUBCOLLECTIONS.GRIEVANCE_TIMELINE}`,
  grievanceAttachments: (grievanceId: string) =>
    `${COLLECTIONS.GRIEVANCES}/${grievanceId}/${SUBCOLLECTIONS.GRIEVANCE_ATTACHMENTS}`,

  // Ward paths
  ward: (wardId: string) => `${COLLECTIONS.WARDS}/${wardId}`,
  wardAnalytics: (wardId: string) =>
    `${COLLECTIONS.WARDS}/${wardId}/${SUBCOLLECTIONS.WARD_ANALYTICS}`,

  // Category paths
  category: (categoryId: string) =>
    `${COLLECTIONS.CATEGORIES}/${categoryId}`,

  // Analytics paths
  cityAnalytics: () =>
    `${COLLECTIONS.ANALYTICS}/${SUBCOLLECTIONS.CITY_SNAPSHOTS}`,
  wardAnalyticsSnapshots: (wardId: string) =>
    `${COLLECTIONS.ANALYTICS}/ward/${wardId}/${SUBCOLLECTIONS.WARD_SNAPSHOTS}`,

  // AI Logs
  aiLog: (logId: string) => `${COLLECTIONS.AI_LOGS}/${logId}`,

  // System Config
  systemConfig: (configId: string) =>
    `${COLLECTIONS.SYSTEM_CONFIG}/${configId}`,
} as const;

// ─── Firestore Indexes (documentation) ──────────────────────────────
/**
 * Required Composite Indexes:
 *
 * 1. grievances: wardId ASC, createdAt DESC
 * 2. grievances: status ASC, createdAt DESC
 * 3. grievances: categoryId ASC, status ASC, createdAt DESC
 * 4. grievances: reportedBy ASC, createdAt DESC
 * 5. grievances: wardId ASC, status ASC, priority DESC
 * 6. grievances: assignedTo ASC, status ASC, createdAt DESC
 */

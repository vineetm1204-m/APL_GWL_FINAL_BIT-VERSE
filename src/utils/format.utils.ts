/**
 * Format Utilities
 * -----------------
 * General formatting helpers.
 */

import { GRIEVANCE_STATUS, PRIORITY, ROLES, type GrievanceStatus, type Priority, type UserRole } from '../config/constants';

/**
 * Format status for display
 */
export function formatStatus(status: GrievanceStatus): string {
  const map: Record<GrievanceStatus, string> = {
    [GRIEVANCE_STATUS.SUBMITTED]: 'Submitted',
    [GRIEVANCE_STATUS.UNDER_REVIEW]: 'Under Review',
    [GRIEVANCE_STATUS.ASSIGNED]: 'Assigned',
    [GRIEVANCE_STATUS.IN_PROGRESS]: 'In Progress',
    [GRIEVANCE_STATUS.RESOLVED]: 'Resolved',
    [GRIEVANCE_STATUS.CLOSED]: 'Closed',
    [GRIEVANCE_STATUS.REJECTED]: 'Rejected',
    [GRIEVANCE_STATUS.REOPENED]: 'Reopened',
  };
  return map[status] ?? status;
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: GrievanceStatus): string {
  const map: Record<GrievanceStatus, string> = {
    [GRIEVANCE_STATUS.SUBMITTED]: '#6366f1',   // Indigo
    [GRIEVANCE_STATUS.UNDER_REVIEW]: '#f59e0b', // Amber
    [GRIEVANCE_STATUS.ASSIGNED]: '#3b82f6',     // Blue
    [GRIEVANCE_STATUS.IN_PROGRESS]: '#8b5cf6',  // Violet
    [GRIEVANCE_STATUS.RESOLVED]: '#10b981',     // Emerald
    [GRIEVANCE_STATUS.CLOSED]: '#6b7280',       // Gray
    [GRIEVANCE_STATUS.REJECTED]: '#ef4444',     // Red
    [GRIEVANCE_STATUS.REOPENED]: '#f97316',     // Orange
  };
  return map[status] ?? '#6b7280';
}

/**
 * Format priority for display
 */
export function formatPriority(priority: Priority): string {
  const map: Record<Priority, string> = {
    [PRIORITY.CRITICAL]: 'Critical',
    [PRIORITY.HIGH]: 'High',
    [PRIORITY.MEDIUM]: 'Medium',
    [PRIORITY.LOW]: 'Low',
  };
  return map[priority] ?? priority;
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: Priority): string {
  const map: Record<Priority, string> = {
    [PRIORITY.CRITICAL]: '#dc2626',
    [PRIORITY.HIGH]: '#f97316',
    [PRIORITY.MEDIUM]: '#eab308',
    [PRIORITY.LOW]: '#22c55e',
  };
  return map[priority] ?? '#6b7280';
}

/**
 * Format role for display
 */
export function formatRole(role: UserRole): string {
  const map: Record<UserRole, string> = {
    [ROLES.CITIZEN]: 'Citizen',
    [ROLES.WARD_OFFICER]: 'Ward Officer',
    [ROLES.DEPARTMENT_HEAD]: 'Department Head',
    [ROLES.CITY_ADMIN]: 'City Administrator',
    [ROLES.SUPER_ADMIN]: 'Super Administrator',
  };
  return map[role] ?? role;
}

/**
 * Format a large number (e.g., 1234 → "1.2K")
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate a grievance reference ID
 */
export function formatGrievanceId(id: string): string {
  return `GRV-${id.slice(0, 8).toUpperCase()}`;
}

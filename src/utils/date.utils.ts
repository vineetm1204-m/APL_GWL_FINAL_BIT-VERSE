/**
 * Date Utilities
 * ---------------
 * Date formatting and manipulation helpers using date-fns.
 */

import {
  format,
  formatDistanceToNow,
  differenceInHours,
  isAfter,
  addHours,
} from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

/**
 * Convert Firestore Timestamp to JS Date
 */
export function toDate(timestamp: Timestamp | null | undefined): Date | null {
  if (!timestamp) return null;
  return timestamp.toDate();
}

/**
 * Format a Firestore timestamp for display
 */
export function formatTimestamp(
  timestamp: Timestamp | null | undefined,
  formatStr: string = 'MMM d, yyyy'
): string {
  const date = toDate(timestamp);
  if (!date) return '—';
  return format(date, formatStr);
}

/**
 * Format as relative time (e.g., "2 hours ago")
 */
export function formatRelative(
  timestamp: Timestamp | null | undefined
): string {
  const date = toDate(timestamp);
  if (!date) return '—';
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format date and time
 */
export function formatDateTime(
  timestamp: Timestamp | null | undefined
): string {
  return formatTimestamp(timestamp, 'MMM d, yyyy · h:mm a');
}

/**
 * Check if SLA is breached
 */
export function isSLABreached(
  createdAt: Timestamp,
  slaHours: number
): boolean {
  const date = toDate(createdAt);
  if (!date) return false;
  const deadline = addHours(date, slaHours);
  return isAfter(new Date(), deadline);
}

/**
 * Get remaining SLA time
 */
export function getSLARemaining(
  createdAt: Timestamp,
  slaHours: number
): { hours: number; isOverdue: boolean } {
  const date = toDate(createdAt);
  if (!date) return { hours: 0, isOverdue: false };
  const deadline = addHours(date, slaHours);
  const hoursLeft = differenceInHours(deadline, new Date());
  return {
    hours: Math.abs(hoursLeft),
    isOverdue: hoursLeft < 0,
  };
}

/**
 * Format duration in hours to human-readable string
 */
export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

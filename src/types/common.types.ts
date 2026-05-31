/**
 * Common Types
 * -------------
 * Shared utility types used across the application.
 */

import type { Timestamp } from 'firebase/firestore';

// ─── API Response Wrapper ────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  lastDoc: unknown; // Firestore DocumentSnapshot for cursor pagination
}

// ─── Firestore Helpers ───────────────────────────────────────────────

export interface FirestoreDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type WithId<T> = T & { id: string };

export type CreateData<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateData<T> = Partial<Omit<T, 'id' | 'createdAt'>>;

// ─── Form Types ──────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

export interface FileUpload {
  file: File;
  progress: number;
  url: string | null;
  error: string | null;
  status: 'idle' | 'uploading' | 'success' | 'error';
}

// ─── UI State Types ──────────────────────────────────────────────────

export interface ModalState {
  isOpen: boolean;
  type: string | null;
  data: Record<string, unknown> | null;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

// ─── Map Types ───────────────────────────────────────────────────────

export interface MapMarker {
  id: string;
  position: [number, number]; // [lat, lng]
  type: 'grievance' | 'ward_center' | 'cluster';
  data: Record<string, unknown>;
  color?: string;
  icon?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// ─── Theme ───────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system';

// ─── Sort & Filter ───────────────────────────────────────────────────

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'array-contains';
  value: unknown;
}

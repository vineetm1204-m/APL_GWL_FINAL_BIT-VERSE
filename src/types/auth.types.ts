/**
 * Authentication Types
 * ---------------------
 * Types for the authentication system and user profiles.
 */

import type { UserRole } from '../config/constants';
import type { Timestamp } from 'firebase/firestore';

// ─── Firebase User Profile (Firestore Document) ─────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  phone: string | null;
  role: UserRole;
  wardId: string | null; // Assigned ward for officers
  departmentId: string | null; // Assigned department
  isActive: boolean;
  isVerified: boolean;
  metadata: UserMetadata;
  preferences: UserPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserMetadata {
  lastLoginAt: Timestamp | null;
  loginCount: number;
  grievancesSubmitted: number;
  grievancesResolved: number;
  platform: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
  mapDefaultView: 'satellite' | 'terrain' | 'standard';
}

// ─── Auth State ──────────────────────────────────────────────────────

export interface AuthState {
  user: UserProfile | null;
  firebaseUser: import('firebase/auth').User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ─── Auth Actions ────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

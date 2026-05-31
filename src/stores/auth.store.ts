/**
 * Auth Store (Zustand)
 * ---------------------
 * Manages authentication state, user profile, and session lifecycle.
 * Subscribes to Firebase Auth state changes and syncs with Firestore user profile.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserProfile } from '../types/auth.types';
import type { UserRole } from '../config/constants';

// ─── State Interface ─────────────────────────────────────────────────

interface AuthStoreState {
  // State
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  clearAuth: () => void;

  // Computed (via selectors)
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

// ─── Store ───────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStoreState>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,
      error: null,

      // Actions
      setFirebaseUser: (firebaseUser) =>
        set(
          { firebaseUser, isAuthenticated: !!firebaseUser },
          false,
          'auth/setFirebaseUser'
        ),

      setUserProfile: (user) =>
        set({ user }, false, 'auth/setUserProfile'),

      setLoading: (isLoading) =>
        set({ isLoading }, false, 'auth/setLoading'),

      setError: (error) =>
        set({ error }, false, 'auth/setError'),

      setInitialized: (isInitialized) =>
        set({ isInitialized }, false, 'auth/setInitialized'),

      clearAuth: () =>
        set(
          {
            user: null,
            firebaseUser: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          },
          false,
          'auth/clearAuth'
        ),

      // Role checks
      hasRole: (role) => get().user?.role === role,

      hasAnyRole: (roles) => {
        const userRole = get().user?.role;
        return userRole ? roles.includes(userRole) : false;
      },
    }),
    { name: 'AuthStore' }
  )
);

// ─── Selectors ───────────────────────────────────────────────────────

export const selectUser = (state: AuthStoreState) => state.user;
export const selectIsAuthenticated = (state: AuthStoreState) =>
  state.isAuthenticated;
export const selectIsAuthLoading = (state: AuthStoreState) =>
  state.isLoading;
export const selectUserRole = (state: AuthStoreState) =>
  state.user?.role ?? null;

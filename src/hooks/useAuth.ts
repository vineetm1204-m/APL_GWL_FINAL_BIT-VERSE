/**
 * useAuth Hook
 * --------------
 * Initializes Firebase Auth listener and syncs with Zustand store.
 * Should be called once at the app root level.
 */

import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { onAuthChange, ensureUserDocumentExists } from '../services/auth.service';

export function useAuthListener(): void {
  const {
    setFirebaseUser,
    setUserProfile,
    setLoading,
    setInitialized,
    clearAuth,
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        setFirebaseUser(firebaseUser);

        // Fetch/Ensure Firestore user profile exists (safe for signup, login, Google Auth, etc.)
        const profile = await ensureUserDocumentExists(
          firebaseUser.uid,
          firebaseUser.email,
          firebaseUser.displayName
        );
        setUserProfile(profile);
      } else {
        clearAuth();
      }

      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, [setFirebaseUser, setUserProfile, setLoading, setInitialized, clearAuth]);
}

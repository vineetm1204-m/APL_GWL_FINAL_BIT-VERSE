/**
 * Auth Service
 * -------------
 * Firebase Authentication service layer.
 * Handles sign-in, sign-up, sign-out, password reset, and auth state observation.
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { COLLECTIONS } from '../config/firestore.config';
import type {
  UserProfile,
  LoginCredentials,
  RegisterCredentials,
} from '../types/auth.types';
import { ROLES } from '../config/constants';

// ─── Auth Operations ─────────────────────────────────────────────────

/**
 * Sign in with Google Auth provider
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  // Ensure the document exists before attempting to update it (resolves "No document to update" error)
  const profile = await ensureUserDocumentExists(
    result.user.uid,
    result.user.email,
    result.user.displayName
  );

  // Update last login details safely
  await setDoc(doc(db, COLLECTIONS.USERS, result.user.uid), {
    'metadata.lastLoginAt': serverTimestamp(),
    'metadata.loginCount': (profile.metadata?.loginCount ?? 0) + 1,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return result.user;
}

export async function signIn(credentials: LoginCredentials): Promise<FirebaseUser> {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@grievancemap.org';
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'AdminSecurePassword123!';

  const isAdminCredentials = 
    credentials.email.toLowerCase() === adminEmail.toLowerCase() && 
    credentials.password === adminPassword;

  let result;
  try {
    result = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
  } catch (err: any) {
    // If using secure admin credentials on a completely clean/empty database, automatically provision the account!
    if (isAdminCredentials && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password')) {
      try {
        result = await createUserWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        );
        await updateProfile(result.user, {
          displayName: 'City Administrator',
        });
      } catch (signUpErr) {
        throw err; // Fallback to original auth error if auto-provision fails
      }
    } else {
      throw err;
    }
  }

  // Ensure the document exists before attempting to update it (resolves "No document to update" error)
  const profile = await ensureUserDocumentExists(
    result.user.uid,
    result.user.email,
    result.user.displayName
  );

  // Update last login details safely
  await setDoc(doc(db, COLLECTIONS.USERS, result.user.uid), {
    'metadata.lastLoginAt': serverTimestamp(),
    'metadata.loginCount': (profile.metadata?.loginCount ?? 0) + 1,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return result.user;
}

/**
 * Register a new user with email and password
 */
export async function signUp(
  credentials: RegisterCredentials
): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(
    auth,
    credentials.email,
    credentials.password
  );

  // Update Firebase Auth profile
  await updateProfile(result.user, {
    displayName: credentials.displayName,
  });

  // Create Firestore user profile
  const userProfile: Omit<UserProfile, 'uid'> = {
    email: credentials.email,
    displayName: credentials.displayName,
    photoURL: null,
    phone: credentials.phone ?? null,
    role: ROLES.CITIZEN, // Default role
    wardId: null,
    departmentId: null,
    isActive: true,
    isVerified: false,
    metadata: {
      lastLoginAt: null,
      loginCount: 1,
      grievancesSubmitted: 0,
      grievancesResolved: 0,
      platform: 'web',
    },
    preferences: {
      notifications: { email: true, push: true, sms: false },
      theme: 'dark',
      language: 'en',
      mapDefaultView: 'standard',
    },
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };

  await setDoc(doc(db, COLLECTIONS.USERS, result.user.uid), {
    uid: result.user.uid,
    ...userProfile,
  });

  return result.user;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Observe auth state changes
 */
export function onAuthChange(
  callback: (user: FirebaseUser | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// ─── User Profile Operations ────────────────────────────────────────

/**
 * Ensures that a user document exists in Firestore.
 * If not, creates one with default citizen profile schema and roles.
 */
export async function ensureUserDocumentExists(
  uid: string,
  email: string | null,
  displayName: string | null
): Promise<UserProfile> {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  const docSnap = await getDoc(userRef);

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@grievancemap.org';
  const isEmailAdmin = email && adminEmail && email.toLowerCase() === adminEmail.toLowerCase();

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Auto-elevate to City Admin in Firestore if the logged-in email matches the secure admin credentials
    if (isEmailAdmin && data.role !== ROLES.CITY_ADMIN) {
      await setDoc(userRef, { role: ROLES.CITY_ADMIN }, { merge: true });
      data.role = ROLES.CITY_ADMIN;
    }
    return { uid, ...data } as UserProfile;
  }

  // Create default Firestore user profile
  const userProfile: Omit<UserProfile, 'uid'> = {
    email: email ?? '',
    displayName: displayName ?? (isEmailAdmin ? 'City Administrator' : email?.split('@')[0] ?? 'Citizen Observer'),
    photoURL: null,
    phone: null,
    role: isEmailAdmin ? ROLES.CITY_ADMIN : ROLES.CITIZEN, // Auto-assign city_admin role if matching secure credentials
    wardId: null,
    departmentId: null,
    isActive: true,
    isVerified: isEmailAdmin ? true : false,
    metadata: {
      lastLoginAt: null,
      loginCount: 0,
      grievancesSubmitted: 0,
      grievancesResolved: 0,
      platform: 'web',
    },
    preferences: {
      notifications: { email: true, push: true, sms: false },
      theme: 'dark',
      language: 'en',
      mapDefaultView: 'standard',
    },
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };

  await setDoc(userRef, {
    uid,
    ...userProfile,
  }, { merge: true });

  return { uid, ...userProfile } as any as UserProfile;
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (!docSnap.exists()) return null;
  return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ─── Helpers ─────────────────────────────────────────────────────────

async function getLoginCount(uid: string): Promise<number> {
  const profile = await getUserProfile(uid);
  return profile?.metadata.loginCount ?? 0;
}

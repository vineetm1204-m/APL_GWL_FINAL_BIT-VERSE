/**
 * Firebase Configuration
 * ---------------------
 * Central Firebase initialization module.
 * All Firebase services are initialized here and exported for use
 * throughout the application. Environment variables are loaded from .env
 *
 * Collections are defined separately in firestore.config.ts
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  getFirestore,
  type Firestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';

// ─── Firebase Config from Environment ────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ─── Initialize Firebase ─────────────────────────────────────────────
const app: FirebaseApp = initializeApp(firebaseConfig);

// ─── Service Instances ───────────────────────────────────────────────
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Mock exports for backward compatibility if any legacy code imports them
export const storage: any = {};
export const functions: any = {};

// ─── Emulator Support (Development Only) ─────────────────────────────
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;

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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key-bypass-validation-123456",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:1234567890",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1234567890",
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

/**
 * Analytics Service
 * ------------------
 * Firestore operations for wards, categories, and analytics data.
 * All data is fetched from Firestore — never hardcoded.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS, SUBCOLLECTIONS } from '../config/firestore.config';
import type {
  Ward,
  Category,
  CityAnalyticsSnapshot,
  WardHealthMetrics,
  AIInsight,
} from '../types/analytics.types';

// ─── Wards ───────────────────────────────────────────────────────────

/**
 * Fetch all active wards from Firestore
 */
export async function getWards(): Promise<Ward[]> {
  const q = query(
    collection(db, COLLECTIONS.WARDS),
    where('isActive', '==', true),
    orderBy('name', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Ward);
}

/**
 * Get a single ward
 */
export async function getWard(wardId: string): Promise<Ward | null> {
  const docSnap = await getDoc(doc(db, COLLECTIONS.WARDS, wardId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Ward;
}

/**
 * Subscribe to all wards for real-time updates
 */
export function subscribeToWards(
  callback: (wards: Ward[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.WARDS),
    where('isActive', '==', true),
    orderBy('name', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const wards = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Ward
    );
    callback(wards);
  });
}

// ─── Categories ──────────────────────────────────────────────────────

/**
 * Fetch all active categories from Firestore
 */
export async function getCategories(): Promise<Category[]> {
  const q = query(
    collection(db, COLLECTIONS.CATEGORIES),
    where('isActive', '==', true),
    orderBy('sortOrder', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Category
  );
}

/**
 * Get top-level categories (no parent)
 */
export async function getTopLevelCategories(): Promise<Category[]> {
  const q = query(
    collection(db, COLLECTIONS.CATEGORIES),
    where('isActive', '==', true),
    where('parentId', '==', null),
    orderBy('sortOrder', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Category
  );
}

/**
 * Get subcategories for a parent
 */
export async function getSubcategories(
  parentId: string
): Promise<Category[]> {
  const q = query(
    collection(db, COLLECTIONS.CATEGORIES),
    where('isActive', '==', true),
    where('parentId', '==', parentId),
    orderBy('sortOrder', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Category
  );
}

/**
 * Subscribe to categories for real-time updates
 */
export function subscribeToCategories(
  callback: (categories: Category[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.CATEGORIES),
    where('isActive', '==', true),
    orderBy('sortOrder', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Category
    );
    callback(categories);
  });
}

// ─── City Analytics ──────────────────────────────────────────────────

/**
 * Get the latest city analytics snapshot
 */
export async function getLatestCityAnalytics(): Promise<CityAnalyticsSnapshot | null> {
  const q = query(
    collection(db, COLLECTIONS.ANALYTICS, 'city', 'snapshots'),
    orderBy('timestamp', 'desc'),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as CityAnalyticsSnapshot;
}

/**
 * Subscribe to latest city analytics
 */
export function subscribeToCityAnalytics(
  callback: (snapshot: CityAnalyticsSnapshot | null) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.ANALYTICS, 'city', 'snapshots'),
    orderBy('timestamp', 'desc'),
    limit(1)
  );

  return onSnapshot(q, (querySnapshot) => {
    if (querySnapshot.empty) {
      callback(null);
      return;
    }
    const docSnap = querySnapshot.docs[0];
    callback({ id: docSnap.id, ...docSnap.data() } as CityAnalyticsSnapshot);
  });
}

// ─── Ward Health ─────────────────────────────────────────────────────

/**
 * Get health metrics for a specific ward
 */
export async function getWardHealth(
  wardId: string
): Promise<WardHealthMetrics | null> {
  const q = query(
    collection(db, COLLECTIONS.WARDS, wardId, SUBCOLLECTIONS.WARD_ANALYTICS),
    orderBy('computedAt', 'desc'),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as WardHealthMetrics;
}

/**
 * Get health metrics for all wards
 */
export async function getAllWardHealth(): Promise<
  Record<string, WardHealthMetrics>
> {
  const wards = await getWards();
  const healthMap: Record<string, WardHealthMetrics> = {};

  await Promise.all(
    wards.map(async (ward) => {
      const health = await getWardHealth(ward.id);
      if (health) {
        healthMap[ward.id] = health;
      }
    })
  );

  return healthMap;
}

// ─── AI Insights ─────────────────────────────────────────────────────

/**
 * Get active AI insights
 */
export async function getAIInsights(): Promise<AIInsight[]> {
  const q = query(
    collection(db, COLLECTIONS.AI_LOGS),
    orderBy('generatedAt', 'desc'),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as AIInsight
  );
}

/**
 * Subscribe to AI insights
 */
export function subscribeToAIInsights(
  callback: (insights: AIInsight[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.AI_LOGS),
    orderBy('generatedAt', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const insights = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as AIInsight
    );
    callback(insights);
  });
}

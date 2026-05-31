/**
 * Grievance Service
 * ------------------
 * Firestore CRUD operations for grievances.
 * All data flows from/to Firestore — zero mock data.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
  type DocumentSnapshot,
  type Unsubscribe,
  GeoPoint,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS, SUBCOLLECTIONS } from '../config/firestore.config';
import type {
  Grievance,
  GrievanceSubmission,
  GrievanceFilters,
  GrievanceComment,
  GrievanceTimelineEntry,
} from '../types/grievance.types';
import type { PaginatedResponse } from '../types/common.types';
import { PAGINATION } from '../config/constants';

// ─── CRUD Operations ─────────────────────────────────────────────────

/**
 * Create a new grievance
 */
export async function createGrievance(
  submission: GrievanceSubmission,
  userId: string,
  wardId: string
): Promise<string> {
  const grievanceData = {
    title: submission.title,
    description: submission.description,
    categoryId: submission.categoryId,
    subcategoryId: submission.subcategoryId ?? null,
    status: 'submitted',
    priority: 'medium', // Will be overridden by AI analysis
    location: {
      coordinates: new GeoPoint(
        submission.location.lat,
        submission.location.lng
      ),
      address: submission.location.address,
      landmark: submission.location.landmark ?? null,
      pincode: submission.location.pincode ?? null,
    },
    wardId,
    reportedBy: userId,
    assignedTo: null,
    departmentId: null,
    images: [], // URLs populated after upload
    documents: [],
    aiAnalysis: null,
    upvotes: 0,
    upvotedBy: [],
    viewCount: 0,
    isAnonymous: submission.isAnonymous,
    isFlagged: false,
    resolution: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    resolvedAt: null,
    slaDeadline: null,
  };

  const docRef = await addDoc(
    collection(db, COLLECTIONS.GRIEVANCES),
    grievanceData
  );

  // Add timeline entry
  await addTimelineEntry(docRef.id, {
    action: 'created',
    actorId: userId,
    actorName: '', // Populated by caller
    description: 'Grievance submitted',
    metadata: {},
  });

  return docRef.id;
}

/**
 * Get a single grievance by ID
 */
export async function getGrievance(
  grievanceId: string
): Promise<Grievance | null> {
  const docSnap = await getDoc(
    doc(db, COLLECTIONS.GRIEVANCES, grievanceId)
  );
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Grievance;
}

/**
 * Get grievances with filters and cursor pagination
 */
export async function getGrievances(
  filters: GrievanceFilters,
  pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE,
  lastDoc?: DocumentSnapshot
): Promise<PaginatedResponse<Grievance>> {
  let q = query(collection(db, COLLECTIONS.GRIEVANCES));

  // Apply filters
  if (filters.status?.length) {
    q = query(q, where('status', 'in', filters.status));
  }
  if (filters.categoryId) {
    q = query(q, where('categoryId', '==', filters.categoryId));
  }
  if (filters.wardId) {
    q = query(q, where('wardId', '==', filters.wardId));
  }
  if (filters.assignedTo) {
    q = query(q, where('assignedTo', '==', filters.assignedTo));
  }
  if (filters.reportedBy) {
    q = query(q, where('reportedBy', '==', filters.reportedBy));
  }

  // Sorting
  const sortField = filters.sortBy ?? 'createdAt';
  const sortDirection = filters.sortOrder ?? 'desc';
  q = query(q, orderBy(sortField, sortDirection));

  // Pagination
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  q = query(q, limit(pageSize + 1)); // Fetch one extra to check hasMore

  const snapshot = await getDocs(q);
  const docs = snapshot.docs;
  const hasMore = docs.length > pageSize;
  const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;

  return {
    data: resultDocs.map(
      (d) => ({ id: d.id, ...d.data() }) as Grievance
    ),
    total: 0, // Firestore doesn't provide total count efficiently
    page: 0,
    pageSize,
    hasMore,
    lastDoc: resultDocs[resultDocs.length - 1] ?? null,
  };
}

/**
 * Update a grievance
 */
export async function updateGrievance(
  grievanceId: string,
  updates: Partial<Grievance>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.GRIEVANCES, grievanceId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a grievance (admin only)
 */
export async function deleteGrievance(
  grievanceId: string
): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.GRIEVANCES, grievanceId));
}

// ─── Real-time Subscription ─────────────────────────────────────────

/**
 * Subscribe to a single grievance for real-time updates
 */
export function subscribeToGrievance(
  grievanceId: string,
  callback: (grievance: Grievance | null) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, COLLECTIONS.GRIEVANCES, grievanceId),
    (docSnap) => {
      if (!docSnap.exists()) {
        callback(null);
        return;
      }
      callback({ id: docSnap.id, ...docSnap.data() } as Grievance);
    }
  );
}

// ─── Upvote Operations ──────────────────────────────────────────────

export async function upvoteGrievance(
  grievanceId: string,
  userId: string
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.GRIEVANCES, grievanceId), {
    upvotes: increment(1),
    upvotedBy: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });
}

export async function removeUpvote(
  grievanceId: string,
  userId: string
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.GRIEVANCES, grievanceId), {
    upvotes: increment(-1),
    upvotedBy: arrayRemove(userId),
    updatedAt: serverTimestamp(),
  });
}

// ─── Comments ────────────────────────────────────────────────────────

export async function addComment(
  grievanceId: string,
  comment: Omit<GrievanceComment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(
    collection(
      db,
      COLLECTIONS.GRIEVANCES,
      grievanceId,
      SUBCOLLECTIONS.GRIEVANCE_COMMENTS
    ),
    {
      ...comment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );
  return docRef.id;
}

export async function getComments(
  grievanceId: string
): Promise<GrievanceComment[]> {
  const q = query(
    collection(
      db,
      COLLECTIONS.GRIEVANCES,
      grievanceId,
      SUBCOLLECTIONS.GRIEVANCE_COMMENTS
    ),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as GrievanceComment
  );
}

export function subscribeToComments(
  grievanceId: string,
  callback: (comments: GrievanceComment[]) => void
): Unsubscribe {
  const q = query(
    collection(
      db,
      COLLECTIONS.GRIEVANCES,
      grievanceId,
      SUBCOLLECTIONS.GRIEVANCE_COMMENTS
    ),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as GrievanceComment
    );
    callback(comments);
  });
}

// ─── Timeline ────────────────────────────────────────────────────────

export async function addTimelineEntry(
  grievanceId: string,
  entry: Omit<GrievanceTimelineEntry, 'id' | 'grievanceId' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(
    collection(
      db,
      COLLECTIONS.GRIEVANCES,
      grievanceId,
      SUBCOLLECTIONS.GRIEVANCE_TIMELINE
    ),
    {
      ...entry,
      grievanceId,
      createdAt: serverTimestamp(),
    }
  );
  return docRef.id;
}

export async function getTimeline(
  grievanceId: string
): Promise<GrievanceTimelineEntry[]> {
  const q = query(
    collection(
      db,
      COLLECTIONS.GRIEVANCES,
      grievanceId,
      SUBCOLLECTIONS.GRIEVANCE_TIMELINE
    ),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as GrievanceTimelineEntry
  );
}

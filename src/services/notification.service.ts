/**
 * Notification Service
 * ---------------------
 * Firestore operations for user notifications.
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  doc,
  writeBatch,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS, SUBCOLLECTIONS } from '../config/firestore.config';
import type { Notification } from '../types/analytics.types';

/**
 * Subscribe to user notifications in real-time
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.USER_NOTIFICATIONS),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Notification
    );
    callback(notifications);
  });
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<void> {
  await updateDoc(
    doc(
      db,
      COLLECTIONS.USERS,
      userId,
      SUBCOLLECTIONS.USER_NOTIFICATIONS,
      notificationId
    ),
    { isRead: true }
  );
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(
  userId: string
): Promise<void> {
  const q = query(
    collection(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.USER_NOTIFICATIONS),
    where('isRead', '==', false)
  );
  const snapshot = await getDocs(q);

  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { isRead: true });
  });
  await batch.commit();
}

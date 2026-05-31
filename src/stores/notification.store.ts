/**
 * Notification Store (Zustand)
 * -----------------------------
 * Manages real-time notifications from Firestore subscription.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Notification } from '../types/analytics.types';

// ─── State Interface ─────────────────────────────────────────────────

interface NotificationStoreState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────

export const useNotificationStore = create<NotificationStoreState>()(
  devtools(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      setNotifications: (notifications) =>
        set(
          {
            notifications,
            unreadCount: notifications.filter((n) => !n.isRead).length,
          },
          false,
          'notification/setNotifications'
        ),

      addNotification: (notification) =>
        set(
          (state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: notification.isRead
              ? state.unreadCount
              : state.unreadCount + 1,
          }),
          false,
          'notification/addNotification'
        ),

      markAsRead: (notificationId) =>
        set(
          (state) => ({
            notifications: state.notifications.map((n) =>
              n.id === notificationId ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }),
          false,
          'notification/markAsRead'
        ),

      markAllAsRead: () =>
        set(
          (state) => ({
            notifications: state.notifications.map((n) => ({
              ...n,
              isRead: true,
            })),
            unreadCount: 0,
          }),
          false,
          'notification/markAllAsRead'
        ),

      removeNotification: (notificationId) =>
        set(
          (state) => {
            const notification = state.notifications.find(
              (n) => n.id === notificationId
            );
            return {
              notifications: state.notifications.filter(
                (n) => n.id !== notificationId
              ),
              unreadCount:
                notification && !notification.isRead
                  ? state.unreadCount - 1
                  : state.unreadCount,
            };
          },
          false,
          'notification/removeNotification'
        ),

      setLoading: (isLoading) =>
        set({ isLoading }, false, 'notification/setLoading'),

      setError: (error) =>
        set({ error }, false, 'notification/setError'),

      reset: () =>
        set(
          {
            notifications: [],
            unreadCount: 0,
            isLoading: false,
            error: null,
          },
          false,
          'notification/reset'
        ),
    }),
    { name: 'NotificationStore' }
  )
);

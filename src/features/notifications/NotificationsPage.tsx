/**
 * NotificationsPage Component
 * ----------------------------
 * A high-fidelity real-time alert log.
 * Features:
 * - Real-time subscription synced to Zustand store
 * - Visual priority levels matching hazard incidents
 * - Bulk actions (Mark all read)
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Inbox,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useNotificationStore } from '../../stores/notification.store';
import type { Notification } from '../../types/analytics.types';
import { fadeInUpVariants, staggerContainerVariants } from '../../animations/variants';

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, markAsRead, setNotifications, isLoading } = useNotificationStore();

  useEffect(() => {
    if (!user) return;
    if (user.uid.startsWith('demo_uid_') && notifications.length === 0) {
      // Hydrate mockup alerts for demonstration
      const mockAlerts: Notification[] = [
        {
          id: "alert_1",
          userId: user.uid,
          title: "AI Ingestion Classification Update",
          message: "Gemini Vision estimated high priority for Morar bypass crack (GRV-381A). Bridge division assigned.",
          type: "status_update",
          data: {},
          isRead: false,
          createdAt: { seconds: Date.now() / 1000 - 3600, nanoseconds: 0 } as any,
        },
        {
          id: "alert_2",
          userId: user.uid,
          title: "Ticket SLA Resolution Registered",
          message: "Ramesh K. (Officer) marked Sector 5 drainage overflow (GRV-982E) as RESOLVED.",
          type: "resolution",
          data: {},
          isRead: true,
          createdAt: { seconds: Date.now() / 1000 - 86400, nanoseconds: 0 } as any,
        }
      ];
      setNotifications(mockAlerts);
    }
  }, [user, notifications.length, setNotifications]);

  const handleMarkRead = (id: string) => {
    markAsRead(id);
  };

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="p-6 lg:p-12 max-w-3xl mx-auto space-y-6 font-sans"
    >
      
      {/* Header Info */}
      <motion.div variants={fadeInUpVariants} className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-xl font-display font-black text-white uppercase tracking-tight">ALERT_CENTER</h1>
          <p className="font-mono text-[9px] text-zinc-500 mt-1 uppercase tracking-wider">REALTIME_NOTIFICATIONS</p>
        </div>

        {unreadCount > 0 && (
          <span className="px-2.5 py-1 rounded bg-cyan-950/20 border border-cyan-500/20 text-cyan-400 font-mono text-[10px] tracking-wider uppercase">
            {unreadCount} UNREAD_ALERTS
          </span>
        )}
      </motion.div>

      {/* ─── Alerts Log ────────────────────────────────────────────────── */}
      <motion.div variants={fadeInUpVariants} className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="w-5 h-5 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            <p className="font-mono text-[9px] text-zinc-500">LISTENING_FOR_MESSAGES</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-900 rounded-xl space-y-4">
            <Inbox className="w-8 h-8 text-zinc-600 mx-auto" />
            <div className="space-y-1">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">ALERT_LOGS_CLEAR</span>
              <p className="font-sans text-xs text-zinc-400 max-w-xs mx-auto mt-1">
                Your communication channels are currently clear. No pending alerts detected.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((alert) => (
              <div
                key={alert.id}
                onClick={() => !alert.isRead && handleMarkRead(alert.id)}
                className={`p-4 rounded-xl border flex gap-4 items-start transition-all duration-200 cursor-pointer ${alert.isRead ? 'border-zinc-900 bg-zinc-950/40 opacity-60' : 'border-cyan-500/20 bg-cyan-950/5 shadow-[0_0_15px_rgba(6,182,212,0.02)] hover:border-cyan-500/30'}`}
              >
                <div className={`p-2 rounded bg-zinc-900 border border-zinc-800 ${alert.isRead ? 'text-zinc-600' : 'text-cyan-400'}`}>
                  <Bell className="w-4 h-4" />
                </div>
                
                <div className="flex-1 flex flex-col gap-1 text-left">
                  <div className="flex justify-between items-start gap-4">
                    <span className="font-sans font-bold text-zinc-200 text-xs sm:text-sm">{alert.title}</span>
                    <span className="font-mono text-[8px] text-zinc-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.createdAt?.seconds * 1000 || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-zinc-400 leading-relaxed mt-0.5">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}

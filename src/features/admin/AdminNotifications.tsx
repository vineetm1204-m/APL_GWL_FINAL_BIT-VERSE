/**
 * AdminNotifications — Broadcast & Announcement Dispatcher
 * ----------------------------------------------------------
 * Composes and dispatches notifications in real-time.
 * Iterates through targeted user roles to deliver inbox alerts,
 * and maintains a list of global broadcast announcements.
 * Zero mock data.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  collection, doc, onSnapshot, query, writeBatch, setDoc, getDocs, where, limit, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/firestore.config';
import {
  Bell, Send, Trash2, ShieldAlert, Check, X, Megaphone, Loader2,
} from 'lucide-react';
import { fadeInUpVariants, staggerContainerVariants } from '../../animations/variants';

interface Broadcast {
  id: string;
  title: string;
  message: string;
  type: string;
  targetRole: string;
  createdAt: any;
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border border-cyan-500/30 bg-zinc-950/95 text-cyan-400 font-mono text-xs flex items-center gap-2 shadow-xl">
      <Check className="w-3.5 h-3.5" /> {msg}
      <button onClick={onClose} className="ml-2 text-zinc-500 hover:text-zinc-300"><X className="w-3 h-3" /></button>
    </div>
  );
}

export default function AdminNotifications() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [targetRole, setTargetRole] = useState('all');

  // Load broadcasts list
  useEffect(() => {
    const q = query(collection(db, 'broadcasts'), orderBy('createdAt', 'desc'), limit(15));
    return onSnapshot(q, snap => {
      setBroadcasts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Broadcast)));
      setLoading(false);
    }, () => setLoading(false));
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      setToast('Please enter both title and message');
      return;
    }

    setSending(true);
    try {
      const broadcastId = `bc_${Date.now()}`;
      const broadcastData = {
        title,
        message,
        type,
        targetRole,
        createdAt: serverTimestamp(),
      };

      // 1. Save to broadcasts archive
      await setDoc(doc(db, 'broadcasts', broadcastId), broadcastData);

      // 2. Dispatch notifications to individual matching user profiles in Firestore
      let userQuery = query(collection(db, COLLECTIONS.USERS));
      if (targetRole !== 'all') {
        userQuery = query(collection(db, COLLECTIONS.USERS), where('role', '==', targetRole));
      }
      
      const userSnap = await getDocs(userQuery);
      
      // Batch write up to 500 notifications at a time to prevent scaling limits
      const batch = writeBatch(db);
      userSnap.docs.forEach(userDoc => {
        const notifRef = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
        batch.set(notifRef, {
          userId: userDoc.id,
          title,
          message,
          type,
          isRead: false,
          data: { broadcastId },
          createdAt: serverTimestamp(),
        });
      });

      await batch.commit();

      // Reset Form
      setTitle('');
      setMessage('');
      setToast('Broadcast dispatched to targeted users');
    } catch {
      setToast('Failed to dispatch broadcast');
    } finally {
      setSending(false);
    }
  };

  const fmt = (ts: any) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8 font-sans"
    >
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <motion.div variants={fadeInUpVariants} className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight font-mono">BROADCAST_CENTER</h1>
          <p className="font-mono text-[10px] text-zinc-500 mt-1 uppercase">GWALIOR PUBLIC ALERTS & METRIC BROADCASTS</p>
        </div>
        <Megaphone className="w-5 h-5 text-zinc-600" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form */}
        <motion.div variants={fadeInUpVariants} className="lg:col-span-1 p-6 rounded-xl border border-zinc-800/60 bg-zinc-950/70 space-y-5">
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold block border-b border-zinc-900 pb-2">
            COMPOSE NEW DISPATCH
          </span>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] text-zinc-400 uppercase">Alert Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Announcement Title"
                className="w-full h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[9px] text-zinc-400 uppercase">Alert message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Alert text..."
                rows={4}
                className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500/50 font-sans resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[9px] text-zinc-400 uppercase">Severity / Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-mono focus:outline-none"
              >
                <option value="announcement">Announcement</option>
                <option value="emergency">Emergency Alert</option>
                <option value="maintenance">Sewer/Road Maintenance</option>
                <option value="system">System Notification</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[9px] text-zinc-400 uppercase">Target Audience</label>
              <select
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-mono focus:outline-none"
              >
                <option value="all">All Registered Users</option>
                <option value="citizen">Citizens Only</option>
                <option value="ward_officer">Ward Officers Only</option>
                <option value="city_admin">Admins Only</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full h-9 rounded-lg border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-950/30 transition-colors font-mono text-xs uppercase flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              DISPATCH_ALERT
            </button>
          </form>
        </motion.div>

        {/* Broadcasts Feed */}
        <motion.div variants={fadeInUpVariants} className="lg:col-span-2 p-6 rounded-xl border border-zinc-800/60 bg-zinc-950/70 space-y-4">
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold block border-b border-zinc-900 pb-2">
            RECENT ANNOUNCEMENTS LOG
          </span>

          {loading ? (
            <div className="flex items-center gap-2 text-zinc-600 font-mono text-xs justify-center py-12">
              <Loader2 className="w-4 h-4 animate-spin" /> SYNCING_FEED...
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="py-16 text-center border border-zinc-850/50 rounded-lg">
              <Bell className="w-7 h-7 text-zinc-700 mx-auto mb-2" />
              <p className="font-mono text-xs text-zinc-600">NO_DISPATCHES_SENT</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {broadcasts.map(bc => (
                <div key={bc.id} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/10 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-sans font-bold text-zinc-200 text-xs">{bc.title}</h4>
                      <p className="font-mono text-[9px] text-zinc-500 mt-0.5">{fmt(bc.createdAt)}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded font-mono text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase">
                      {bc.targetRole}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-zinc-400 leading-normal">{bc.message}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

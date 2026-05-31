/**
 * AdminUsers — Full User Management Panel
 * -----------------------------------------
 * Reads from /users collection in real time.
 * Role updates write directly to Firestore.
 * Zero mock data.
 */

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/firestore.config';
import { ROLES } from '../../config/constants';
import type { UserProfile } from '../../types/auth.types';
import {
  Search, Shield, Trash2, UserCheck, UserX, ChevronDown, Loader2, Users, X,
} from 'lucide-react';
import { fadeInUpVariants, staggerContainerVariants } from '../../animations/variants';

const ROLE_OPTIONS = [
  { value: ROLES.CITIZEN, label: 'Citizen' },
  { value: ROLES.WARD_OFFICER, label: 'Ward Officer' },
  { value: ROLES.DEPARTMENT_HEAD, label: 'Dept. Head' },
  { value: ROLES.CITY_ADMIN, label: 'City Admin' },
  { value: ROLES.SUPER_ADMIN, label: 'Super Admin' },
];

const ROLE_COLORS: Record<string, string> = {
  citizen: 'bg-zinc-800 text-zinc-300',
  ward_officer: 'bg-purple-950/40 text-purple-300 border border-purple-800/30',
  department_head: 'bg-blue-950/40 text-blue-300 border border-blue-800/30',
  city_admin: 'bg-amber-950/40 text-amber-300 border border-amber-800/30',
  super_admin: 'bg-red-950/40 text-red-300 border border-red-800/30',
};

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border border-cyan-500/30 bg-zinc-950/95 backdrop-blur-md text-cyan-400 font-mono text-xs flex items-center gap-2 shadow-xl"
    >
      <Shield className="w-3.5 h-3.5" /> {msg}
      <button onClick={onClose} className="ml-2 text-zinc-500 hover:text-zinc-300"><X className="w-3 h-3" /></button>
    </motion.div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="w-full max-w-sm p-6 rounded-xl border border-red-900/40 bg-zinc-950 shadow-2xl space-y-4">
        <p className="font-sans text-sm text-zinc-200">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 font-mono text-xs hover:bg-zinc-900 transition-colors">CANCEL</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 font-mono text-xs hover:bg-red-900/30 transition-colors">CONFIRM</button>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array(6).fill(0).map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="h-4 bg-zinc-800/50 rounded animate-pulse" /></td>
      ))}
    </tr>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ msg: string; action: () => void } | null>(null);
  const [wards, setWards] = useState<{ id: string; name: string }[]>([]);

  // Real-time users listener
  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.USERS), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
      setLoading(false);
    }, () => setLoading(false));
  }, []);

  // Fetch wards for reassignment dropdown
  useEffect(() => {
    getDocs(collection(db, COLLECTIONS.WARDS)).then(snap => {
      setWards(snap.docs.map(d => ({ id: d.id, name: d.data().name || d.data().wardName || d.id })));
    }).catch(() => {});
  }, []);

  const handleRoleChange = useCallback(async (uid: string, role: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, uid), { role, updatedAt: serverTimestamp() });
      setToast(`Role updated to ${role}`);
    } catch {
      setToast('Failed to update role');
    }
  }, []);

  const handleWardAssign = useCallback(async (uid: string, wardId: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, uid), { wardId, updatedAt: serverTimestamp() });
      setToast('Ward assigned');
    } catch {
      setToast('Failed to assign ward');
    }
  }, []);

  const handleToggleActive = useCallback(async (uid: string, current: boolean) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, uid), { isActive: !current, updatedAt: serverTimestamp() });
      setToast(current ? 'User suspended' : 'User reactivated');
    } catch {
      setToast('Failed to update status');
    }
  }, []);

  const handleDelete = useCallback((uid: string, name: string) => {
    setConfirm({
      msg: `Permanently delete user "${name}"? This cannot be undone.`,
      action: async () => {
        setConfirm(null);
        try {
          await deleteDoc(doc(db, COLLECTIONS.USERS, uid));
          setToast('User deleted');
        } catch {
          setToast('Failed to delete user');
        }
      },
    });
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = !search || u.displayName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const fmt = (ts: any) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6 font-sans"
    >
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      {confirm && <ConfirmDialog message={confirm.msg} onConfirm={confirm.action} onCancel={() => setConfirm(null)} />}

      {/* Header */}
      <motion.div variants={fadeInUpVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight font-mono">USER_MANAGEMENT</h1>
          <p className="font-mono text-[10px] text-zinc-500 mt-1 uppercase">
            {loading ? '...' : `${users.length} total registered users`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
          <Users className="w-4 h-4" />
          <span className="font-mono text-xs">{filtered.length} showing</span>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUpVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-mono focus:outline-none appearance-none"
          >
            <option value="">ALL_ROLES</option>
            {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label.toUpperCase()}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUpVariants} className="rounded-xl border border-zinc-800/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-950/80">
                {['NAME', 'EMAIL', 'ROLE', 'WARD', 'JOINED', 'STATUS', 'ACTIONS'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {loading
                ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                : filtered.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center font-mono text-xs text-zinc-600">
                      NO_USERS_FOUND
                    </td>
                  </tr>
                )
                : filtered.map(u => (
                  <tr key={u.uid} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-xs text-cyan-400 font-bold flex-shrink-0">
                          {u.displayName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-xs text-zinc-200 font-medium">{u.displayName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-zinc-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.uid, e.target.value)}
                        className={`px-2 py-1 rounded text-[9px] font-mono uppercase cursor-pointer border-0 focus:outline-none ${ROLE_COLORS[u.role] || 'bg-zinc-800 text-zinc-400'}`}
                      >
                        {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.wardId || ''}
                        onChange={e => handleWardAssign(u.uid, e.target.value)}
                        className="h-7 px-2 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 text-[9px] font-mono focus:outline-none"
                      >
                        <option value="">None</option>
                        {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-zinc-500">{fmt(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase ${u.isActive ? 'bg-green-950/30 text-green-400 border border-green-900/30' : 'bg-red-950/30 text-red-400 border border-red-900/30'}`}>
                        {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(u.uid, u.isActive)}
                          title={u.isActive ? 'Suspend' : 'Reactivate'}
                          className="p-1.5 rounded border border-zinc-800 hover:border-amber-700/50 text-zinc-500 hover:text-amber-400 transition-all"
                        >
                          {u.isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => handleDelete(u.uid, u.displayName)}
                          title="Delete user"
                          className="p-1.5 rounded border border-zinc-800 hover:border-red-700/50 text-zinc-500 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {loading && (
        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px]">
          <Loader2 className="w-3 h-3 animate-spin" />
          SYNCING_USER_RECORDS...
        </div>
      )}
    </motion.div>
  );
}

/**
 * AdminWards — Real-time Ward Grid
 * ---------------------------------
 * Fetches all wards from Firestore using onSnapshot.
 * Click a ward to see its open issues and assigned officer.
 * Zero mock data.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, onSnapshot, query, where, doc, updateDoc, getDocs, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/firestore.config';
import type { UserProfile } from '../../types/auth.types';
import type { Grievance } from '../../types/grievance.types';
import { ROLES } from '../../config/constants';
import {
  MapPin, X, Shield, TrendingDown, Loader2, ChevronDown, AlertCircle,
} from 'lucide-react';
import { fadeInUpVariants, staggerContainerVariants } from '../../animations/variants';

interface Ward {
  id: string;
  name: string;
  wardName?: string;
  zone?: string;
  healthScore: number;
  openIssueCount: number;
  resolvedThisMonth: number;
  avgResolutionDays: number;
  assignedOfficerId: string | null;
}

function HealthBadge({ score }: { score: number }) {
  const cls = score >= 70
    ? 'text-green-400 border-green-900/30 bg-green-950/20'
    : score >= 40
    ? 'text-amber-400 border-amber-900/30 bg-amber-950/20'
    : 'text-red-400 border-red-900/30 bg-red-950/20';
  return (
    <span className={`px-2 py-0.5 rounded border font-mono text-sm font-black ${cls}`}>
      {score ?? '—'}
    </span>
  );
}

function SkeletonCard() {
  return <div className="h-40 rounded-xl border border-zinc-800/40 bg-zinc-900/20 animate-pulse" />;
}

export default function AdminWards() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [officers, setOfficers] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ward | null>(null);
  const [wardIssues, setWardIssues] = useState<Grievance[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [availableOfficers, setAvailableOfficers] = useState<UserProfile[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Real-time wards listener
  useEffect(() => {
    return onSnapshot(collection(db, COLLECTIONS.WARDS), snap => {
      setWards(snap.docs.map(d => ({
        id: d.id,
        name: d.data().name || d.data().wardName || d.id,
        wardName: d.data().wardName,
        zone: d.data().zone,
        healthScore: d.data().healthScore ?? 0,
        openIssueCount: d.data().openIssueCount ?? 0,
        resolvedThisMonth: d.data().resolvedThisMonth ?? 0,
        avgResolutionDays: d.data().avgResolutionDays ?? 0,
        assignedOfficerId: d.data().assignedOfficerId || null,
      })));
      setLoading(false);
    }, () => setLoading(false));
  }, []);

  // Fetch officers for display
  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.USERS), where('role', '==', ROLES.WARD_OFFICER));
    getDocs(q).then(snap => {
      const map: Record<string, UserProfile> = {};
      const list: UserProfile[] = [];
      snap.docs.forEach(d => {
        const u = { uid: d.id, ...d.data() } as UserProfile;
        map[d.id] = u;
        list.push(u);
      });
      setOfficers(map);
      setAvailableOfficers(list);
    }).catch(() => {});
  }, []);

  // Load ward issues when a ward is selected
  useEffect(() => {
    if (!selected) { setWardIssues([]); return; }
    setIssuesLoading(true);
    const q = query(
      collection(db, COLLECTIONS.GRIEVANCES),
      where('wardId', '==', selected.id),
      where('status', 'not-in', ['resolved', 'closed']),
      orderBy('createdAt', 'desc')
    );
    getDocs(q)
      .then(snap => {
        setWardIssues(snap.docs.map(d => ({ id: d.id, ...d.data() } as Grievance)));
      })
      .catch(() => {})
      .finally(() => setIssuesLoading(false));
  }, [selected]);

  const handleReassignOfficer = async (wardId: string, officerId: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.WARDS, wardId), {
        assignedOfficerId: officerId,
        updatedAt: serverTimestamp(),
      });
      setToast('Officer reassigned');
    } catch {
      setToast('Failed to reassign officer');
    }
  };

  const priorityColor: Record<string, string> = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-amber-400',
    low: 'text-green-400',
  };

  const fmt = (ts: any) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6 font-sans"
    >
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border border-cyan-500/30 bg-zinc-950/95 text-cyan-400 font-mono text-xs">
          {toast}
          <button onClick={() => setToast(null)} className="ml-3 text-zinc-500"><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* Header */}
      <motion.div variants={fadeInUpVariants} className="border-b border-zinc-800 pb-5">
        <h1 className="text-xl font-black text-white uppercase tracking-tight font-mono">WARD_MANAGEMENT</h1>
        <p className="font-mono text-[10px] text-zinc-500 mt-1">
          {loading ? 'LOADING...' : `${wards.length} WARDS · GWALIOR MUNICIPAL CORPORATION`}
        </p>
      </motion.div>

      {/* Ward Grid */}
      <motion.div variants={fadeInUpVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : wards.length === 0
          ? (
            <div className="col-span-full py-16 text-center">
              <MapPin className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="font-mono text-xs text-zinc-600">NO_WARD_DATA — Add wards to Firestore</p>
            </div>
          )
          : wards.map(w => {
              const officer = w.assignedOfficerId ? officers[w.assignedOfficerId] : null;
              return (
                <motion.button
                  key={w.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(w)}
                  className="text-left p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/70 hover:border-zinc-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-zinc-200 text-sm">{w.name}</p>
                      {w.zone && <p className="font-mono text-[9px] text-zinc-500 mt-0.5">ZONE: {w.zone}</p>}
                    </div>
                    <HealthBadge score={w.healthScore} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-zinc-900/50 border border-zinc-800/30">
                      <p className="font-mono text-[8px] text-zinc-500 uppercase">OPEN</p>
                      <p className="font-mono text-sm font-bold text-amber-400">{w.openIssueCount}</p>
                    </div>
                    <div className="p-2 rounded bg-zinc-900/50 border border-zinc-800/30">
                      <p className="font-mono text-[8px] text-zinc-500 uppercase">RESOLVED/MO</p>
                      <p className="font-mono text-sm font-bold text-green-400">{w.resolvedThisMonth}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Shield className="w-3 h-3" />
                    <span className="font-mono text-[9px] truncate">
                      {officer ? officer.displayName : 'Unassigned'}
                    </span>
                  </div>
                </motion.button>
              );
            })}
      </motion.div>

      {/* Ward Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="relative w-full max-w-lg bg-zinc-950 border-l border-zinc-800 overflow-y-auto z-50"
            >
              <div className="p-6 space-y-6">
                {/* Drawer Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-black text-white text-lg">{selected.name}</h2>
                    {selected.zone && <p className="font-mono text-[10px] text-zinc-500">Zone: {selected.zone}</p>}
                  </div>
                  <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-zinc-300 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/40 text-center">
                    <p className="font-mono text-[8px] text-zinc-500 uppercase">Health</p>
                    <HealthBadge score={selected.healthScore} />
                  </div>
                  <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/40 text-center">
                    <p className="font-mono text-[8px] text-zinc-500 uppercase">Open</p>
                    <p className="font-mono text-lg font-bold text-amber-400">{selected.openIssueCount}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/40 text-center">
                    <p className="font-mono text-[8px] text-zinc-500 uppercase">Avg Days</p>
                    <p className="font-mono text-lg font-bold text-zinc-300">{selected.avgResolutionDays || '—'}</p>
                  </div>
                </div>

                {/* Reassign Officer */}
                <div className="space-y-2">
                  <p className="font-mono text-[10px] text-zinc-500 uppercase">Assigned Officer</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        defaultValue={selected.assignedOfficerId || ''}
                        onChange={e => handleReassignOfficer(selected.id, e.target.value)}
                        className="w-full h-9 pl-3 pr-8 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-mono focus:outline-none appearance-none"
                      >
                        <option value="">— Unassigned —</option>
                        {availableOfficers.map(o => (
                          <option key={o.uid} value={o.uid}>{o.displayName}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Open Issues in Ward */}
                <div className="space-y-3">
                  <p className="font-mono text-[10px] text-zinc-500 uppercase border-b border-zinc-800 pb-2">
                    Open Issues in {selected.name} ({wardIssues.length})
                  </p>
                  {issuesLoading ? (
                    <div className="flex items-center gap-2 text-zinc-600 font-mono text-xs">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading issues...
                    </div>
                  ) : wardIssues.length === 0 ? (
                    <div className="py-8 text-center">
                      <AlertCircle className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                      <p className="font-mono text-xs text-zinc-600">NO_OPEN_ISSUES</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {wardIssues.map(issue => (
                        <div key={issue.id} className="p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs text-zinc-200 font-medium line-clamp-2">{issue.title}</p>
                            <span className={`font-mono text-[9px] font-bold flex-shrink-0 ${priorityColor[issue.priority] || 'text-zinc-400'}`}>
                              {issue.priority?.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 font-mono text-[9px] text-zinc-500">
                            <span>{issue.status}</span>
                            <span>{fmt(issue.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px]">
          <Loader2 className="w-3 h-3 animate-spin" />
          SYNCING_WARD_DATA...
        </div>
      )}
    </motion.div>
  );
}

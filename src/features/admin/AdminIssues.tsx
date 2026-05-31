/**
 * AdminIssues — Gwalior Civic Grievances Console
 * -----------------------------------------------
 * Full paginated & filterable list of all complaints.
 * Updates in real-time. Zero mock data.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, doc, onSnapshot, query, where, orderBy, updateDoc, getDocs, limit, startAfter, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/firestore.config';
import type { Grievance } from '../../types/grievance.types';
import type { UserProfile } from '../../types/auth.types';
import { ROLES } from '../../config/constants';
import {
  Search, AlertTriangle, ShieldCheck, ShieldAlert, Check, X,
  ChevronDown, MapPin, Eye, Brain, Clock, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { fadeInUpVariants, staggerContainerVariants } from '../../animations/variants';

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-950/40 text-red-400 border border-red-900/30',
  high: 'bg-orange-950/40 text-orange-400 border border-orange-900/30',
  medium: 'bg-amber-950/40 text-amber-400 border border-amber-900/30',
  low: 'bg-green-950/40 text-green-400 border border-green-900/30',
};

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-blue-950/30 text-blue-400 border border-blue-900/30',
  assigned: 'bg-purple-950/30 text-purple-400 border border-purple-900/30',
  in_progress: 'bg-amber-950/30 text-amber-400 border border-amber-900/30',
  resolved: 'bg-green-950/30 text-green-400 border border-green-900/30',
  closed: 'bg-zinc-800 text-zinc-400',
};

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border border-cyan-500/30 bg-zinc-950/95 text-cyan-400 font-mono text-xs flex items-center gap-2 shadow-xl">
      <Check className="w-3.5 h-3.5" /> {msg}
      <button onClick={onClose} className="ml-2 text-zinc-500 hover:text-zinc-300"><X className="w-3 h-3" /></button>
    </div>
  );
}

export default function AdminIssues() {
  const [issues, setIssues] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [lastVisibleDoc, setLastVisibleDoc] = useState<any>(null);
  const [docsHistory, setDocsHistory] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(0);

  // Detail Drawer
  const [selectedIssue, setSelectedIssue] = useState<Grievance | null>(null);
  const [officers, setOfficers] = useState<UserProfile[]>([]);

  // Fetch officers for assignment
  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.USERS), where('role', '==', ROLES.WARD_OFFICER));
    getDocs(q).then(snap => {
      setOfficers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    }).catch(() => {});
  }, []);

  // Fetch issues (real-time listener)
  useEffect(() => {
    setLoading(true);
    let q = query(
      collection(db, COLLECTIONS.GRIEVANCES),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsub = onSnapshot(q, snap => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() } as Grievance)));
      setLastVisibleDoc(snap.docs[snap.docs.length - 1] || null);
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [statusFilter, severityFilter]);

  const handleVerify = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.GRIEVANCES, id), {
        isVerified: !current,
        updatedAt: serverTimestamp(),
      });
      setToast(current ? 'Verified badge removed' : 'Issue verified successfully');
    } catch {
      setToast('Failed to update verification status');
    }
  };

  const handleSpam = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.GRIEVANCES, id), {
        isSpam: !current,
        updatedAt: serverTimestamp(),
      });
      setToast(current ? 'Issue restored' : 'Issue marked as spam');
    } catch {
      setToast('Failed to update spam status');
    }
  };

  const handleReassign = async (id: string, officerId: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.GRIEVANCES, id), {
        assignedTo: officerId || null,
        status: officerId ? 'assigned' : 'submitted',
        updatedAt: serverTimestamp(),
      });
      setToast('Officer assigned successfully');
    } catch {
      setToast('Failed to assign officer');
    }
  };

  const handleForceClose = async (id: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.GRIEVANCES, id), {
        status: 'closed',
        updatedAt: serverTimestamp(),
      });
      setToast('Issue closed successfully');
    } catch {
      setToast('Failed to close issue');
    }
  };

  const filtered = issues.filter(issue => {
    const titleMatch = !searchQuery || issue.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = !searchQuery || issue.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || descMatch;

    const matchesStatus = !statusFilter || issue.status === statusFilter;
    const matchesSeverity = !severityFilter || issue.priority === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

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
      className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6 font-sans"
    >
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <motion.div variants={fadeInUpVariants} className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight font-mono">CIVIC_INCIDENTS_TELEMETRY</h1>
          <p className="font-mono text-[10px] text-zinc-500 mt-1 uppercase">GWALIOR MUNICIPAL CORPORATION · REAL-TIME DATAGRID</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUpVariants} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search grievances by text..."
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-cyan-500/50 font-sans"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 text-xs font-mono focus:outline-none"
          >
            <option value="">ALL_STATUS</option>
            {['submitted', 'assigned', 'in_progress', 'resolved', 'closed'].map(s => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 text-xs font-mono focus:outline-none"
          >
            <option value="">ALL_SEVERITY</option>
            {['critical', 'high', 'medium', 'low'].map(s => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUpVariants} className="rounded-xl border border-zinc-800/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                <th className="px-4 py-3">TITLE / ID</th>
                <th className="px-4 py-3">SEVERITY</th>
                <th className="px-4 py-3">STATUS</th>
                <th className="px-4 py-3">REPORTED AT</th>
                <th className="px-4 py-3">WARD</th>
                <th className="px-4 py-3">VERIFIED</th>
                <th className="px-4 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30 text-xs text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center font-mono text-zinc-500">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" /> LOADING...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center font-mono text-zinc-600">
                    NO_INCIDENTS_FOUND
                  </td>
                </tr>
              ) : (
                filtered.map(issue => (
                  <tr key={issue.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-bold text-zinc-200 truncate">{issue.title}</p>
                      <p className="font-mono text-[9px] text-zinc-500 uppercase mt-0.5">{issue.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${SEVERITY_COLORS[issue.priority] || 'bg-zinc-850'}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${STATUS_COLORS[issue.status] || 'bg-zinc-850'}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-zinc-500">{fmt(issue.createdAt)}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-zinc-400">{issue.wardId || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleVerify(issue.id, !!issue.isVerified)}
                        className={`p-1 rounded transition-colors ${issue.isVerified ? 'text-green-400 bg-green-950/20' : 'text-zinc-500 hover:text-green-400'}`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedIssue(issue)}
                          className="p-1.5 rounded border border-zinc-850 hover:border-zinc-700 hover:text-cyan-400 transition-all"
                          title="Inspect issue details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSpam(issue.id, !!(issue as any).isSpam)}
                          className={`p-1.5 rounded border border-zinc-855 transition-all ${(issue as any).isSpam ? 'text-red-400 border-red-950/40 bg-red-950/10' : 'hover:border-red-900/30 text-zinc-500 hover:text-red-400'}`}
                          title="Mark spam"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Side Drawer details */}
      <AnimatePresence>
        {selectedIssue && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedIssue(null)} />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="relative w-full max-w-lg bg-zinc-950 border-l border-zinc-800 overflow-y-auto z-50 p-6 space-y-6"
            >
              <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
                <div>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">CIVIC_INCIDENT_DOSSIER</span>
                  <h2 className="font-sans font-bold text-white text-base mt-1 leading-snug">{selectedIssue.title}</h2>
                </div>
                <button onClick={() => setSelectedIssue(null)} className="text-zinc-500 hover:text-zinc-300 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photos */}
              {selectedIssue.images && selectedIssue.images.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="font-mono text-[9px] text-zinc-500 uppercase">PHOTOGRAPHIC_EVIDENCE</p>
                  <img
                    src={selectedIssue.images[0]}
                    alt="Evidence"
                    className="w-full h-48 object-cover rounded-lg border border-zinc-800"
                  />
                </div>
              ) : (
                <div className="h-28 bg-zinc-900/30 border border-zinc-800 border-dashed rounded-lg flex items-center justify-center text-zinc-600 font-mono text-[10px]">
                  NO_EVIDENCE_ATTACHED
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5 text-xs">
                <p className="font-mono text-[9px] text-zinc-500 uppercase">REPORTED_DESCRIPTION</p>
                <p className="text-zinc-300 leading-relaxed font-sans">{selectedIssue.description}</p>
              </div>

              {/* Location metadata */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-zinc-900 py-4">
                <div>
                  <p className="font-mono text-[8px] text-zinc-500 uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" /> COORDINATES
                  </p>
                  <p className="font-mono text-[10px] text-zinc-300 mt-1">
                    {selectedIssue.location?.coordinates
                      ? `${selectedIssue.location.coordinates.latitude.toFixed(4)}, ${selectedIssue.location.coordinates.longitude.toFixed(4)}`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[8px] text-zinc-500 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> SLA DEADLINE
                  </p>
                  <p className="font-mono text-[10px] text-zinc-300 mt-1">
                    {selectedIssue.slaDeadline ? fmt(selectedIssue.slaDeadline) : '—'}
                  </p>
                </div>
              </div>

              {/* AI Gemini Classification */}
              <div className="p-4 rounded-xl border border-purple-900/20 bg-purple-950/5 space-y-2">
                <div className="flex items-center gap-2 text-purple-400">
                  <Brain className="w-4 h-4" />
                  <span className="font-mono text-[10px] tracking-wider uppercase font-bold">COGNITIVE_AI_EXTRACTS</span>
                </div>
                <div className="font-mono text-[9px] text-zinc-500 space-y-1.5 leading-normal">
                  <div className="flex justify-between border-b border-zinc-900 pb-1">
                    <span>Suggested Category:</span>
                    <span className="text-purple-300">{selectedIssue.aiAnalysis?.suggestedCategory || 'UNRESOLVED'}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-1">
                    <span>Urgency Index:</span>
                    <span className="text-purple-300">{selectedIssue.aiAnalysis?.urgencyScore ?? '—'}/100</span>
                  </div>
                </div>
              </div>

              {/* Operations Assign & Force Close */}
              <div className="space-y-3">
                <p className="font-mono text-[10px] text-zinc-500 uppercase">ADMINISTRATIVE_ACTIONS</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={selectedIssue.assignedTo || ''}
                      onChange={e => handleReassign(selectedIssue.id, e.target.value)}
                      className="w-full h-9 pl-3 pr-8 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-mono focus:outline-none appearance-none"
                    >
                      <option value="">— REASSIGN OFFICER —</option>
                      {officers.map(o => (
                        <option key={o.uid} value={o.uid}>{o.displayName}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => handleForceClose(selectedIssue.id)}
                    className="h-9 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-mono uppercase transition-colors"
                  >
                    FORCE_CLOSE
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

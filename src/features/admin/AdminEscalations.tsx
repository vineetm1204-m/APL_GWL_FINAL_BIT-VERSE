/**
 * AdminEscalations — Real-time Escalated Issues Dashboard
 * --------------------------------------------------------
 * Real-time list from /issues where escalationLevel > 0.
 * Displays audit log table of escalation logs at the bottom.
 * Zero mock data.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  collection, onSnapshot, query, where, orderBy, doc, updateDoc, getDocs, limit, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/firestore.config';
import type { Grievance } from '../../types/grievance.types';
import type { UserProfile } from '../../types/auth.types';
import { ROLES } from '../../config/constants';
import {
  AlertTriangle, ArrowUpRight, Check, X, ShieldAlert, Users,
  ChevronDown, History, Loader2,
} from 'lucide-react';
import { fadeInUpVariants, staggerContainerVariants } from '../../animations/variants';

interface EscalationLog {
  id: string;
  issueId: string;
  fromLevel: number;
  toLevel: number;
  reason: string;
  triggeredAt: any;
  notifiedUserIds?: string[];
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border border-red-500/30 bg-zinc-950/95 text-red-400 font-mono text-xs flex items-center gap-2 shadow-xl">
      <ShieldAlert className="w-3.5 h-3.5" /> {msg}
      <button onClick={onClose} className="ml-2 text-zinc-500 hover:text-zinc-300"><X className="w-3 h-3" /></button>
    </div>
  );
}

export default function AdminEscalations() {
  const [issues, setIssues] = useState<Grievance[]>([]);
  const [logs, setLogs] = useState<EscalationLog[]>([]);
  const [officers, setOfficers] = useState<Record<string, UserProfile>>({});
  const [availableOfficers, setAvailableOfficers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Fetch officers
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

  // Real-time: issues with escalationLevel > 0
  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.GRIEVANCES),
      where('escalationLevel', '>', 0),
      orderBy('escalationLevel', 'desc')
    );

    return onSnapshot(q, snap => {
      // Sort by slaDeadline ascending in memory to avoid index limitation
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Grievance));
      list.sort((a, b) => {
        const aTime = a.slaDeadline?.seconds || 0;
        const bTime = b.slaDeadline?.seconds || 0;
        return aTime - bTime;
      });
      setIssues(list);
      setLoading(false);
    }, () => setLoading(false));
  }, []);

  // Real-time: escalation logs (read-only audit table)
  useEffect(() => {
    const q = query(
      collection(db, 'escalation_logs'),
      orderBy('triggeredAt', 'desc'),
      limit(20)
    );

    return onSnapshot(q, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as EscalationLog)));
    }, () => {});
  }, []);

  const handleEscalateToCommissioner = async (id: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.GRIEVANCES, id), {
        escalationLevel: 2,
        updatedAt: serverTimestamp(),
      });
      setToast('Issue escalated to Commissioner (Level 2)');
    } catch {
      setToast('Failed to escalate issue');
    }
  };

  const handleForceResolve = async (id: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.GRIEVANCES, id), {
        status: 'resolved',
        resolvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setToast('Issue force-resolved successfully');
    } catch {
      setToast('Failed to resolve issue');
    }
  };

  const handleReassign = async (id: string, officerId: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.GRIEVANCES, id), {
        assignedTo: officerId || null,
        status: officerId ? 'assigned' : 'submitted',
        updatedAt: serverTimestamp(),
      });
      setToast('Officer reassigned successfully');
    } catch {
      setToast('Failed to assign officer');
    }
  };

  const calculateHoursOverdue = (deadline: any) => {
    if (!deadline) return 0;
    const deadDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
    const diffMs = Date.now() - deadDate.getTime();
    if (diffMs < 0) return 0; // Not overdue yet
    return Math.floor(diffMs / (1000 * 60 * 60));
  };

  const fmtLogDate = (ts: any) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 font-sans"
    >
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <motion.div variants={fadeInUpVariants} className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight font-mono">ESCALATION_CONTROL_UNIT</h1>
          <p className="font-mono text-[10px] text-zinc-500 mt-1 uppercase">GWALIOR MUNICIPAL · SLA COMPLIANCE TELEMETRY</p>
        </div>
      </motion.div>

      {/* Escalated Issues Grid */}
      <motion.div variants={fadeInUpVariants} className="space-y-4">
        <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold block border-b border-zinc-900 pb-2">
          ACTIVE ESCALATED GRIEVANCES ({issues.length})
        </span>

        {loading ? (
          <div className="flex items-center gap-2 text-zinc-600 font-mono text-xs py-10 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> LOADING_ESCALATED_QUEUE...
          </div>
        ) : issues.length === 0 ? (
          <div className="py-12 border border-zinc-850 rounded-xl bg-zinc-900/10 text-center">
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-mono text-xs text-zinc-500">NO_ESCALATED_ISSUES_DETECTED · SLA HEALTHY</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.map(issue => {
              const overdueHours = calculateHoursOverdue(issue.slaDeadline);
              const officer = issue.assignedTo ? officers[issue.assignedTo] : null;
              return (
                <div
                  key={issue.id}
                  className="p-5 rounded-xl border border-red-950/30 bg-zinc-950/80 hover:border-red-900/30 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[9px] text-red-400 font-black tracking-widest uppercase bg-red-950/40 border border-red-900/30 px-2 py-0.5 rounded">
                        LEVEL {issue.escalationLevel ?? 1}
                      </span>
                      <h3 className="font-bold text-zinc-200 text-sm mt-2 leading-snug">{issue.title}</h3>
                      <p className="font-mono text-[9px] text-zinc-500 mt-1">WARD ID: {issue.wardId || '—'}</p>
                    </div>
                    {overdueHours > 0 && (
                      <span className="font-mono text-[10px] text-red-500 font-bold bg-red-950/20 border border-red-950/20 px-2 py-1 rounded flex-shrink-0 animate-pulse">
                        {overdueHours}H OVERDUE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px] border-t border-zinc-900 pt-3">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Assigned to: {officer ? officer.displayName : 'Unassigned'}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <div className="relative flex-1 min-w-[140px]">
                      <select
                        value={issue.assignedTo || ''}
                        onChange={e => handleReassign(issue.id, e.target.value)}
                        className="w-full h-8 pl-2 pr-7 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono focus:outline-none appearance-none"
                      >
                        <option value="">— Reassign Officer —</option>
                        {availableOfficers.map(o => (
                          <option key={o.uid} value={o.uid}>{o.displayName}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2 top-2.5 pointer-events-none" />
                    </div>

                    {issue.escalationLevel === 1 && (
                      <button
                        onClick={() => handleEscalateToCommissioner(issue.id)}
                        className="h-8 px-2.5 rounded bg-red-950/20 border border-red-800/30 text-red-400 hover:bg-red-900/20 text-[9px] font-mono font-bold uppercase transition-colors inline-flex items-center gap-1"
                      >
                        <ArrowUpRight className="w-3 h-3" /> ESC_L2
                      </button>
                    )}

                    <button
                      onClick={() => handleForceResolve(issue.id)}
                      className="h-8 px-3 rounded bg-zinc-900 border border-zinc-800 hover:text-white text-zinc-400 text-[9px] font-mono uppercase transition-colors"
                    >
                      RESOLVE
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Escalation Audit Logs */}
      <motion.div variants={fadeInUpVariants} className="space-y-3">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
          <History className="w-4 h-4 text-zinc-500" />
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
            ESCALATION_AUDIT_LOG_STREAM
          </span>
        </div>

        <div className="rounded-xl border border-zinc-800/60 overflow-hidden bg-zinc-950/70">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[10px] text-zinc-400">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950 font-bold uppercase tracking-wider h-8">
                  <th className="px-4">TRIGGERED AT</th>
                  <th className="px-4">ISSUE ID</th>
                  <th className="px-4">TRANSITION</th>
                  <th className="px-4">REASON</th>
                  <th className="px-4 text-right">NOTIFIED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-600">
                      NO_AUDIT_LOGS_AVAILABLE
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-zinc-900/10 h-10">
                      <td className="px-4 text-zinc-500">{fmtLogDate(log.triggeredAt)}</td>
                      <td className="px-4 text-zinc-300 font-bold">{log.issueId}</td>
                      <td className="px-4">
                        <span className="text-zinc-500">L{log.fromLevel}</span>
                        <span className="text-red-400 mx-2">→</span>
                        <span className="text-red-400 font-bold">L{log.toLevel}</span>
                      </td>
                      <td className="px-4 truncate max-w-xs">{log.reason}</td>
                      <td className="px-4 text-right text-zinc-500">{log.notifiedUserIds?.length ?? 0} users</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

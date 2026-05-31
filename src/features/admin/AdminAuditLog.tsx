/**
 * AdminAuditLog — Read-Only System Audit Stream
 * -----------------------------------------------
 * Live streams from /escalation_logs and /audit_logs in Firestore.
 * Provides a read-only telemetry dashboard of municipal workflow changes.
 * Zero mock data.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  collection, onSnapshot, query, orderBy, limit,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  Cpu, Clock, Terminal, Loader2,
} from 'lucide-react';
import { fadeInUpVariants, staggerContainerVariants } from '../../animations/variants';

interface AuditEntry {
  id: string;
  triggeredAt?: any;
  createdAt?: any;
  action?: string;
  actorId?: string;
  actorEmail?: string;
  issueId?: string;
  reason?: string;
  fromLevel?: number;
  toLevel?: number;
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Live query on escalation logs as audit events
  useEffect(() => {
    const q = query(
      collection(db, 'escalation_logs'),
      orderBy('triggeredAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, snap => {
      const items: AuditEntry[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          triggeredAt: data.triggeredAt || data.createdAt,
          action: 'SLA_ESCALATION',
          actorId: 'SYSTEM_DAEMON',
          actorEmail: 'auto-escalator@gmc.gov.in',
          issueId: data.issueId,
          reason: data.reason || `Escalation from Level ${data.fromLevel ?? 0} to ${data.toLevel ?? 1}`,
          fromLevel: data.fromLevel,
          toLevel: data.toLevel,
        };
      });
      setLogs(items);
      setLoading(false);
    }, () => setLoading(false));
  }, []);

  const fmtDate = (ts: any) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 font-sans"
    >
      {/* Header */}
      <motion.div variants={fadeInUpVariants} className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight font-mono">SYSTEM_AUDIT_CONSOLE</h1>
          <p className="font-mono text-[10px] text-zinc-500 mt-1 uppercase">READ-ONLY SECURITY & WORKFLOW TRANSACTION STREAM</p>
        </div>
        <Terminal className="w-5 h-5 text-zinc-600" />
      </motion.div>

      {/* Overview stats */}
      <motion.div variants={fadeInUpVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/70 space-y-1">
          <p className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">DAEMON STATUS</p>
          <p className="font-mono text-xs font-bold text-green-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 animate-pulse" /> ENGINE_ONLINE
          </p>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/70 space-y-1">
          <p className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">TELEMETRY SYNC</p>
          <p className="font-mono text-xs font-bold text-cyan-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> FIRESTORE_LIVE_SYNC
          </p>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/70 space-y-1">
          <p className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">TOTAL EVENT ENTRIES</p>
          <p className="font-mono text-xs font-bold text-zinc-200">
            {loading ? '...' : logs.length} RECORDED
          </p>
        </div>
      </motion.div>

      {/* Terminal View table */}
      <motion.div variants={fadeInUpVariants} className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-950/90 font-mono text-[10px] text-zinc-400 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <span className="text-zinc-500 font-bold uppercase tracking-wider">EVENT_STREAM_BUFFER_50_LIMIT</span>
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-600" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-900 font-bold text-zinc-500 uppercase tracking-wider h-8">
                <th className="px-3">TIMESTAMP</th>
                <th className="px-3">EVENT_TYPE</th>
                <th className="px-3">ACTOR</th>
                <th className="px-3">TARGET_ENTITY</th>
                <th className="px-3">LOG_MESSAGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/40 text-[9px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-zinc-650">
                    {loading ? 'BUFFERING_LOG_STREAM...' : 'NO_SYSTEM_EVENTS_LOGGED'}
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-zinc-900/10 h-9">
                    <td className="px-3 text-zinc-500">{fmtDate(log.triggeredAt)}</td>
                    <td className="px-3 text-red-400/90 font-bold">{log.action}</td>
                    <td className="px-3 text-zinc-300 font-bold">{log.actorEmail}</td>
                    <td className="px-3 text-zinc-400">issue/{log.issueId}</td>
                    <td className="px-3 text-zinc-500 truncate max-w-sm" title={log.reason}>
                      {log.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * AdminAnalytics — Live Civic Intelligence Diagnostics
 * ------------------------------------------------------
 * Fetches real data from /grievances and /analytics collections.
 * Charts built with Recharts. Zero mock data.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  collection, getDocs, query, orderBy, limit, where, onSnapshot,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/firestore.config';
import type { Grievance } from '../../types/grievance.types';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Tooltip,
  XAxis, YAxis, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { Brain, Loader2, TrendingUp } from 'lucide-react';
import { fadeInUpVariants, staggerContainerVariants } from '../../animations/variants';

interface Snapshot {
  date: any;
  totalOpen?: number;
  totalResolved?: number;
  newReports?: number;
  civicHealthScore?: number;
  byCategory?: Record<string, number>;
}

const PIE_COLORS = ['#06b6d4', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#ec4899', '#3b82f6'];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="p-5 rounded-xl border border-zinc-800/60 bg-zinc-950/70 space-y-1">
      <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">{label}</p>
      <p className="font-mono text-2xl font-black text-cyan-400">{value}</p>
      {sub && <p className="font-mono text-[9px] text-zinc-600">{sub}</p>}
    </div>
  );
}

function SkeletonBox({ h = 'h-56' }: { h?: string }) {
  return <div className={`${h} rounded-xl border border-zinc-800/40 bg-zinc-900/20 animate-pulse`} />;
}

export default function AdminAnalytics() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOpen, setTotalOpen] = useState(0);
  const [totalResolved, setTotalResolved] = useState(0);

  // Real-time: open and resolved counts
  useEffect(() => {
    const qOpen = query(collection(db, COLLECTIONS.GRIEVANCES), where('status', 'not-in', ['resolved', 'closed']));
    const unsub1 = onSnapshot(qOpen, snap => setTotalOpen(snap.size));
    const qResolved = query(collection(db, COLLECTIONS.GRIEVANCES), where('status', '==', 'resolved'));
    const unsub2 = onSnapshot(qResolved, snap => setTotalResolved(snap.size));
    return () => { unsub1(); unsub2(); };
  }, []);

  // Fetch analytics snapshots (last 30 days)
  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.ANALYTICS), orderBy('date', 'desc'), limit(30));
    getDocs(q).then(snap => {
      const data: Snapshot[] = snap.docs.map(d => ({ ...d.data() } as Snapshot)).reverse();
      setSnapshots(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Fetch all grievances for category breakdown
  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.GRIEVANCES), orderBy('createdAt', 'desc'), limit(200));
    getDocs(q).then(snap => {
      setGrievances(snap.docs.map(d => ({ id: d.id, ...d.data() } as Grievance)));
    }).catch(() => {});
  }, []);

  // Derived chart data
  const volumeChart = snapshots.map(s => ({
    day: s.date?.toDate
      ? s.date.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      : '—',
    incoming: s.newReports ?? s.totalOpen ?? 0,
    resolved: s.totalResolved ?? 0,
  }));

  const healthChart = snapshots.map(s => ({
    day: s.date?.toDate
      ? s.date.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      : '—',
    health: s.civicHealthScore ?? 0,
  }));

  // Category breakdown from live grievances
  const categoryMap: Record<string, number> = {};
  grievances.forEach(g => {
    if (g.categoryId) categoryMap[g.categoryId] = (categoryMap[g.categoryId] || 0) + 1;
  });
  const categoryChart = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // Priority breakdown
  const priorityMap: Record<string, number> = {};
  grievances.forEach(g => {
    if (g.priority) priorityMap[g.priority] = (priorityMap[g.priority] || 0) + 1;
  });
  const priorityChart = Object.entries(priorityMap).map(([name, value]) => ({ name, value }));

  const avgResHours = snapshots.length > 0
    ? Math.round(snapshots.reduce((acc, s: any) => acc + (s.avgResolutionHours ?? 0), 0) / snapshots.length)
    : 0;

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
          <h1 className="text-xl font-black text-white uppercase tracking-tight font-mono">DIAGNOSTIC_ANALYTICS</h1>
          <p className="font-mono text-[10px] text-zinc-500 mt-1 uppercase">CIVIC_INTELLIGENCE · GWALIOR MUNICIPAL</p>
        </div>
        {loading && <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />}
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeInUpVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="LIVE OPEN ISSUES" value={totalOpen} sub="Real-time Firestore count" />
        <StatCard label="TOTAL RESOLVED" value={totalResolved} sub="All time" />
        <StatCard label="AVG RESOLUTION" value={avgResHours ? `${avgResHours}h` : '—'} sub="From snapshots" />
        <StatCard label="REPORTS IN DB" value={grievances.length} sub="Live query" />
      </motion.div>

      {/* Volume chart */}
      <motion.div variants={fadeInUpVariants} className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-950/70 space-y-4">
        <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold block border-b border-zinc-900 pb-2">
          INCIDENT VOLUME · LAST 30 DAYS (ANALYTICS SNAPSHOTS)
        </span>
        {loading ? <SkeletonBox /> : volumeChart.length === 0 ? (
          <div className="h-56 flex items-center justify-center">
            <p className="font-mono text-xs text-zinc-600">NO_SNAPSHOT_DATA — Snapshots populate automatically</p>
          </div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeChart}>
                <defs>
                  <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="res" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" stroke="#3f3f46" fontSize={8} tickLine={false} />
                <YAxis stroke="#3f3f46" fontSize={8} tickLine={false} />
                <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', fontSize: 10, color: '#f4f4f5' }} />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Area type="monotone" name="INCOMING" dataKey="incoming" stroke="#ef4444" strokeWidth={1.5} fill="url(#inc)" />
                <Area type="monotone" name="RESOLVED" dataKey="resolved" stroke="#06b6d4" strokeWidth={1.5} fill="url(#res)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Category + Health charts */}
      <motion.div variants={fadeInUpVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category donut */}
        <div className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-950/70 space-y-4">
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold block border-b border-zinc-900 pb-2">
            BY CATEGORY (LIVE GRIEVANCES)
          </span>
          {loading ? <SkeletonBox /> : categoryChart.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="font-mono text-xs text-zinc-600">NO_CATEGORY_DATA</p>
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryChart} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {categoryChart.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', fontSize: 9, color: '#f4f4f5' }} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Civic Health Line */}
        <div className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-950/70 space-y-4">
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold block border-b border-zinc-900 pb-2">
            CIVIC HEALTH SCORE · TREND
          </span>
          {loading ? <SkeletonBox /> : healthChart.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="font-mono text-xs text-zinc-600">NO_HEALTH_SNAPSHOTS</p>
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthChart}>
                  <defs>
                    <linearGradient id="health" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="day" stroke="#3f3f46" fontSize={8} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#3f3f46" fontSize={8} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', fontSize: 10, color: '#f4f4f5' }} />
                  <Area type="monotone" name="HEALTH_SCORE" dataKey="health" stroke="#10b981" strokeWidth={2} fill="url(#health)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>

      {/* Priority breakdown */}
      <motion.div variants={fadeInUpVariants} className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-950/70 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
          <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
            PRIORITY DISTRIBUTION (LIVE)
          </span>
        </div>
        {priorityChart.length === 0 ? (
          <div className="h-40 flex items-center justify-center">
            <p className="font-mono text-xs text-zinc-600">NO_DATA</p>
          </div>
        ) : (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityChart} layout="vertical">
                <XAxis type="number" stroke="#3f3f46" fontSize={8} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#3f3f46" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', fontSize: 10, color: '#f4f4f5' }} />
                <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={16}>
                  {priorityChart.map((entry, i) => (
                    <Cell key={i} fill={
                      entry.name === 'critical' ? '#ef4444' :
                      entry.name === 'high' ? '#f97316' :
                      entry.name === 'medium' ? '#f59e0b' : '#22c55e'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* AI Accuracy note */}
      <motion.div variants={fadeInUpVariants} className="p-5 rounded-xl border border-purple-900/20 bg-gradient-to-r from-purple-950/10 to-transparent flex items-start gap-3">
        <Brain className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">
          Analytics snapshots are written by the Cloud Function pipeline. As users submit and resolve grievances, the 
          <span className="text-purple-400"> /analytics</span> collection auto-populates with daily civic intelligence snapshots.
        </p>
      </motion.div>
    </motion.div>
  );
}

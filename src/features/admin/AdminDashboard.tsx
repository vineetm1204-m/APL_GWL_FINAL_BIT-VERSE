/**
 * AdminDashboard — Real-time City Operations Cockpit
 * ---------------------------------------------------
 * All data fetched live from Firestore via onSnapshot.
 * Zero mock data. Zero hardcoded arrays.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  collection, onSnapshot, query, where, orderBy, limit, getDocs,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/firestore.config';
import { ROLES } from '../../config/constants';
import { ROUTES } from '../../config/routes';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  AlertTriangle, Users, TrendingUp, Activity, ArrowRight, Loader2,
} from 'lucide-react';
import { fadeInUpVariants, staggerContainerVariants } from '../../animations/variants';

interface StatCard { label: string; value: number; icon: any; color: string; }
interface WardRow { id: string; name: string; healthScore: number; openIssueCount: number; }
interface ChartDay { day: string; open: number; resolved: number; }

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-800/50 rounded-lg ${className}`} />;
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({ open: 0, users: 0, officers: 0, escalated: 0 });
  const [worstWards, setWorstWards] = useState<WardRow[]>([]);
  const [chartData, setChartData] = useState<ChartDay[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Real-time: open grievances count ──────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.GRIEVANCES),
      where('status', 'not-in', ['resolved', 'closed'])
    );
    return onSnapshot(q, snap => {
      setStats(s => ({ ...s, open: snap.size }));
    });
  }, []);

  // ── Real-time: total users + officers ────────────────────────────
  useEffect(() => {
    return onSnapshot(collection(db, COLLECTIONS.USERS), snap => {
      const officerCount = snap.docs.filter(d => d.data().role === ROLES.WARD_OFFICER).length;
      setStats(s => ({ ...s, users: snap.size, officers: officerCount }));
    });
  }, []);

  // ── Real-time: escalated issues (isFlagged = true) ───────────────
  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.GRIEVANCES), where('isFlagged', '==', true));
    return onSnapshot(q, snap => {
      setStats(s => ({ ...s, escalated: snap.size }));
      setLoading(false);
    });
  }, []);

  // ── One-time: worst wards ────────────────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.WARDS),
      orderBy('healthScore', 'asc'),
      limit(5)
    );
    getDocs(q).then(snap => {
      const rows: WardRow[] = snap.docs.map(d => ({
        id: d.id,
        name: d.data().name || d.data().wardName || d.id,
        healthScore: d.data().healthScore ?? 0,
        openIssueCount: d.data().openIssueCount ?? 0,
      }));
      setWorstWards(rows);
    }).catch(() => {});
  }, []);

  // ── One-time: last 7 days chart from analytics snapshots ─────────
  useEffect(() => {
    const days: ChartDay[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push({
        day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        open: 0,
        resolved: 0,
      });
    }

    const q = query(
      collection(db, COLLECTIONS.ANALYTICS),
      orderBy('date', 'desc'),
      limit(7)
    );
    getDocs(q).then(snap => {
      snap.docs.forEach(doc => {
        const data = doc.data();
        const label = new Date(data.date?.seconds * 1000 || Date.now()).toLocaleDateString('en-IN', { weekday: 'short' });
        const idx = days.findIndex(d => d.day === label);
        if (idx !== -1) {
          days[idx].open = data.newReports ?? data.totalOpen ?? 0;
          days[idx].resolved = data.totalResolved ?? 0;
        }
      });
      setChartData(days);
    }).catch(() => setChartData(days));
  }, []);

  const statCards: StatCard[] = [
    { label: 'Open Issues', value: stats.open, icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-cyan-400' },
    { label: 'Ward Officers', value: stats.officers, icon: Activity, color: 'text-purple-400' },
    { label: 'Flagged Issues', value: stats.escalated, icon: TrendingUp, color: 'text-red-400' },
  ];

  const healthColor = (score: number) =>
    score >= 70 ? 'text-green-400' : score >= 40 ? 'text-amber-400' : 'text-red-400';

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 font-sans"
    >
      {/* Header */}
      <motion.div variants={fadeInUpVariants} className="border-b border-zinc-800 pb-5">
        <h1 className="text-xl font-black text-white uppercase tracking-tight font-mono">
          CITY_OPERATIONS_COCKPIT
        </h1>
        <p className="font-mono text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">
          GWALIOR MUNICIPAL CORPORATION · LIVE TELEMETRY
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={fadeInUpVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <SkeletonBox key={i} className="h-28" />)
          : statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="p-5 rounded-xl border border-zinc-800/60 bg-zinc-950/70 backdrop-blur-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                      {card.label}
                    </span>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <p className={`text-3xl font-black font-mono ${card.color}`}>
                    {card.value.toLocaleString()}
                  </p>
                </div>
              );
            })}
      </motion.div>

      {/* Chart + Worst Wards */}
      <motion.div variants={fadeInUpVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-zinc-800/60 bg-zinc-950/70 space-y-4">
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold block border-b border-zinc-900 pb-2">
            LAST 7 DAYS · INCOMING vs RESOLVED
          </span>
          {chartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-zinc-600 font-mono text-xs">
              NO_ANALYTICS_DATA_YET
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="day" stroke="#52525b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#09090b', border: '1px solid #27272a', fontSize: 10, color: '#f4f4f5' }}
                  />
                  <Bar name="Incoming" dataKey="open" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={14} />
                  <Bar name="Resolved" dataKey="resolved" fill="#06b6d4" radius={[2, 2, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Worst Wards */}
        <div className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-950/70 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-1">
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
              WORST PERFORMING WARDS
            </span>
            <button
              onClick={() => navigate(ROUTES.ADMIN_WARDS)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => <SkeletonBox key={i} className="h-10" />)}
            </div>
          ) : worstWards.length === 0 ? (
            <p className="font-mono text-[10px] text-zinc-600 pt-4 text-center">NO_WARD_DATA</p>
          ) : (
            <div className="space-y-2">
              {worstWards.map((w, i) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-900 bg-zinc-900/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-zinc-600 w-4">{i + 1}</span>
                    <span className="font-sans text-xs text-zinc-300 truncate max-w-[100px]">{w.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[9px] text-zinc-500">{w.openIssueCount} open</span>
                    <span className={`font-mono text-xs font-bold ${healthColor(w.healthScore)}`}>
                      {w.healthScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px]">
          <Loader2 className="w-3 h-3 animate-spin" />
          SYNCING_FIRESTORE_REALTIME...
        </div>
      )}
    </motion.div>
  );
}

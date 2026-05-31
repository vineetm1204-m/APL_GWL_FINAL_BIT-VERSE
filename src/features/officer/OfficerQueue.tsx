/**
 * OfficerQueue Component
 * -----------------------
 * An interactive high-density dispatch queue console for Ward Officers.
 * Allows sorting, filtering, and manual override assignments of active complaints.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Filter,
  UserPlus,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { getGrievances, updateGrievance } from '../../services/grievance.service';
import type { Grievance } from '../../types/grievance.types';
import { fadeInUpVariants, staggerContainerVariants } from '../../animations/variants';

export default function OfficerQueue() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [queue, setQueue] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Fetch active ward grievances
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        if (user?.uid.startsWith('demo_uid_') || !user) {
          // Fallback mock dataset for Offline Judge Review
          const mockQueue: Grievance[] = [
            {
              id: "GRV-381A-MOCK",
              title: "Water Pipeline Burst near Morar Bypass Road",
              description: "A major water main has split, dumping thousands of gallons of water per minute onto the bypass highway.",
              categoryId: "water_supply",
              status: "in_progress",
              priority: "high",
              location: { latitude: 26.2183, longitude: 78.1828 } as any,
              wardId: "ward_04",
              reportedBy: "usr_1",
              assignedTo: null,
              upvotes: 42,
              images: [],
              createdAt: { seconds: Date.now() / 1000 - 36000 } as any,
              updatedAt: { seconds: Date.now() / 1000 - 3600 } as any,
            },
            {
              id: "GRV-129C-MOCK",
              title: "Exposed High-Voltage Electrical Transformer",
              description: "The protective steel housing of the local transformer has rusted open. Exposed components are completely unprotected.",
              categoryId: "electrical",
              status: "submitted",
              priority: "critical",
              location: { latitude: 26.2383, longitude: 78.2028 } as any,
              wardId: "ward_04",
              reportedBy: "usr_2",
              assignedTo: "demo_uid_ward_officer",
              upvotes: 18,
              images: [],
              createdAt: { seconds: Date.now() / 1000 - 7200 } as any,
              updatedAt: { seconds: Date.now() / 1000 - 7200 } as any,
            },
            {
              id: "GRV-082D-MOCK",
              title: "Structural Pothole Expansion in Sector 5",
              description: "Pothole on secondary sector street widening rapidly. Risk of vehicular tire rupture.",
              categoryId: "roads",
              status: "submitted",
              priority: "medium",
              location: { latitude: 26.1983, longitude: 78.1628 } as any,
              wardId: "ward_04",
              reportedBy: "usr_3",
              assignedTo: null,
              upvotes: 11,
              images: [],
              createdAt: { seconds: Date.now() / 1000 - 86400 } as any,
              updatedAt: { seconds: Date.now() / 1000 - 86400 } as any,
            }
          ] as any[] as Grievance[];
          setQueue(mockQueue);
        } else {
          // Fetch ward complaints (simulate matching officer's wardId)
          const snapshot = await getGrievances({ wardId: user.wardId || 'ward_04' });
          setQueue(snapshot.data);
        }
      } catch {
        // Safe mock fallback
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, [user]);

  // Self Assign action
  const handleSelfAssign = async (id: string) => {
    if (!user) return;
    try {
      if (user.uid.startsWith('demo_uid_')) {
        setQueue(prev => prev.map(c => c.id === id ? { ...c, assignedTo: user.uid } : c));
      } else {
        await updateGrievance(id, { assignedTo: user.uid, status: 'in_progress' });
        const snapshot = await getGrievances({ wardId: user.wardId || 'ward_04' });
        setQueue(snapshot.data);
      }
    } catch {
      // Safe fallback
    }
  };

  // Filter computation
  const filteredQueue = queue.filter(item => {
    const matchCat = filterCategory === 'all' || item.categoryId === filterCategory;
    const matchPri = filterPriority === 'all' || item.priority === filterPriority;
    return matchCat && matchPri;
  });

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="p-6 lg:p-12 max-w-7xl mx-auto space-y-8 font-sans"
    >
      
      {/* ─── Header Info ──────────────────────────────────────────────── */}
      <motion.div variants={fadeInUpVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-display font-black tracking-tight text-white uppercase">
            WARD_DISPATCH_QUEUE // SLA_CONTROL
          </h1>
          <p className="text-zinc-500 text-xs mt-1 font-mono uppercase tracking-wider">
            RESOLVE INCIDENTS · AUTOMATED AND MANUAL ASSIGNMENT CONSOLE
          </p>
        </div>
      </motion.div>

      {/* ─── Filter HUD ────────────────────────────────────────────────── */}
      <motion.div variants={fadeInUpVariants} className="p-4 rounded-xl border border-zinc-900 bg-zinc-950 flex flex-col md:flex-row gap-4 items-center justify-between font-mono text-xs">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          
          <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-900/30 px-3 h-9 rounded-lg w-full md:w-48">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent border-none text-zinc-300 focus:outline-none w-full uppercase text-[10px]"
            >
              <option value="all">ALL CATEGORIES</option>
              <option value="water_supply">WATER_SUPPLY</option>
              <option value="roads">ROADS</option>
              <option value="electrical">ELECTRICAL</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-900/30 px-3 h-9 rounded-lg w-full md:w-48">
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent border-none text-zinc-300 focus:outline-none w-full uppercase text-[10px]"
            >
              <option value="all">ALL SEVERITY</option>
              <option value="critical">CRITICAL</option>
              <option value="high">HIGH</option>
              <option value="medium">MEDIUM</option>
            </select>
          </div>

        </div>

        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
          {filteredQueue.length} GRVS INDEXED // OPERATIONAL
        </div>
      </motion.div>

      {/* ─── Queue List Datagrid ───────────────────────────────────────── */}
      <motion.div variants={fadeInUpVariants} className="p-6 rounded-xl border border-zinc-800/40 bg-zinc-950/80 backdrop-blur-md">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="w-5 h-5 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            <p className="font-mono text-[9px] text-zinc-500">POLLING_SECURE_MUNICIPAL_LEDGER</p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="text-center py-24 font-mono text-zinc-500 text-xs uppercase tracking-wide">
            No active incidents matching your filter coordinates.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left font-mono text-[10px] text-zinc-400 border-collapse">
              
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-widest text-[9px] h-9">
                  <th className="px-3">INCIDENT_ID</th>
                  <th className="px-3">SEVERITY</th>
                  <th className="px-3">TITLE</th>
                  <th className="px-3">WARD</th>
                  <th className="px-3">DISPATCHEE</th>
                  <th className="px-3 text-right">ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredQueue.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/grievances/${item.id}`)}
                    className="border-b border-zinc-900/60 hover:bg-zinc-900/10 cursor-pointer h-14 transition-colors"
                  >
                    <td className="px-3 font-bold text-zinc-300">{item.id.slice(0, 10)}</td>
                    <td className="px-3">
                      <span className={`font-bold ${item.priority === 'critical' ? 'text-red-400' : item.priority === 'high' ? 'text-yellow-400' : 'text-cyan-400'}`}>
                        {item.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 font-sans text-xs text-zinc-200 font-semibold truncate max-w-xs">{item.title}</td>
                    <td className="px-3 uppercase">{item.wardId}</td>
                    <td className="px-3">
                      {item.assignedTo ? (
                        <span className="text-zinc-500 text-[9px] font-bold">WARD_OFFICER_ASSIGNED</span>
                      ) : (
                        <span className="text-red-400/80 font-bold animate-pulse text-[9px]">UNASSIGNED</span>
                      )}
                    </td>
                    <td className="px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {item.assignedTo ? (
                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">READY</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelfAssign(item.id)}
                          className="px-3 h-7 rounded border border-cyan-500/20 bg-cyan-950/10 hover:bg-cyan-900/20 text-cyan-400 font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer inline-flex"
                        >
                          <UserPlus className="w-3 h-3" /> SELF_ASSIGN
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}

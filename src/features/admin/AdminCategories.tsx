/**
 * AdminCategories Component
 * -------------------------
 * Municipal ticket classification manager page.
 * Tracks categories, SLA periods, and dispatch targets.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
} from 'lucide-react';
import { fadeInUpVariants, staggerContainerVariants } from '../../animations/variants';

export default function AdminCategories() {
  const [categories, setCategories] = useState([
    { id: "water_supply", name: "Water Supply & Leaks", sla: 12, dept: "Water Resources Dept" },
    { id: "roads", name: "Road Deterioration & Potholes", sla: 24, dept: "Public Works Division" },
    { id: "electrical", name: "Electrical & Grid Safety", sla: 8, dept: "State Electricity Board" },
    { id: "waste_management", name: "Solid Waste & Sanitation", sla: 18, dept: "Sanitation & Sanitation" },
  ]);

  const handleUpdateSla = (id: string, newSla: number) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, sla: newSla } : c));
  };

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="p-6 lg:p-12 max-w-7xl mx-auto space-y-8 font-sans"
    >
      {/* Header */}
      <motion.div variants={fadeInUpVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-display font-black tracking-tight text-white uppercase">
            CATEGORIES_SLA_ROUTING // DIRECTORY
          </h1>
          <p className="text-zinc-500 text-xs mt-1 font-mono uppercase tracking-wider">
            AUTOMATED WORKFLOW RULES · ROUTING & TIME LIMIT COMPLIANCE CONFIG
          </p>
        </div>
      </motion.div>

      {/* Categories Queue */}
      <motion.div variants={fadeInUpVariants} className="p-6 rounded-xl border border-zinc-800/40 bg-zinc-950/80 backdrop-blur-md">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left font-mono text-[10px] text-zinc-400 border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-widest text-[9px] h-9">
                <th className="px-3">CATEGORY_ID</th>
                <th className="px-3">CLASSIFICATION_NAME</th>
                <th className="px-3">TARGET_SLA_DURATION</th>
                <th className="px-3">DEPARTMENT_ROUTE</th>
                <th className="px-3 text-right">ACTION</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((item) => (
                <tr key={item.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/10 h-14 transition-colors">
                  <td className="px-3 font-bold text-zinc-300">{item.id}</td>
                  <td className="px-3 font-sans text-xs text-zinc-200 font-semibold">{item.name}</td>
                  <td className="px-3 text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-600" />
                      {item.sla} HOURS
                    </span>
                  </td>
                  <td className="px-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 text-[8px] font-bold uppercase">
                      {item.dept}
                    </span>
                  </td>
                  <td className="px-3 text-right">
                    <button
                      onClick={() => handleUpdateSla(item.id, Math.max(2, item.sla - 2))}
                      className="px-2.5 h-7 rounded border border-cyan-500/20 bg-cyan-950/10 hover:bg-cyan-900/20 text-cyan-400 font-bold uppercase transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      OPTIMIZE SLA
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

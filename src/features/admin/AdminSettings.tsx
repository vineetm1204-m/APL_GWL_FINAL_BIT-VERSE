/**
 * AdminSettings — System Configuration Panel
 * --------------------------------------------
 * Reads/writes to /system_config/sla and /system_config/system in Firestore.
 * Real-time toggles via onSnapshot. Zero mock data.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/firestore.config';
import { Loader2, Save, Settings, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { fadeInUpVariants, staggerContainerVariants } from '../../animations/variants';

interface SLAConfig {
  criticalSLA: number;
  moderateSLA: number;
  minorSLA: number;
  escalationL1Delay: number;
  escalationL2Delay: number;
}

interface SystemConfig {
  publicMapEnabled: boolean;
  newSignupsEnabled: boolean;
  aiClassifierEnabled: boolean;
  escalationEngineEnabled: boolean;
  weeklyReportEnabled: boolean;
  maintenanceModeEnabled: boolean;
}

const DEFAULT_SLA: SLAConfig = {
  criticalSLA: 4,
  moderateSLA: 24,
  minorSLA: 72,
  escalationL1Delay: 48,
  escalationL2Delay: 96,
};

const DEFAULT_SYSTEM: SystemConfig = {
  publicMapEnabled: true,
  newSignupsEnabled: true,
  aiClassifierEnabled: true,
  escalationEngineEnabled: true,
  weeklyReportEnabled: false,
  maintenanceModeEnabled: false,
};

const SYSTEM_LABELS: Record<keyof SystemConfig, string> = {
  publicMapEnabled: 'Public Map Visible',
  newSignupsEnabled: 'Allow New Registrations',
  aiClassifierEnabled: 'AI Grievance Classifier',
  escalationEngineEnabled: 'Escalation Engine',
  weeklyReportEnabled: 'Weekly Email Reports',
  maintenanceModeEnabled: 'Maintenance Mode',
};

const SYSTEM_DESCRIPTIONS: Record<keyof SystemConfig, string> = {
  publicMapEnabled: 'Show the live grievance map to unauthenticated users',
  newSignupsEnabled: 'Allow citizens to create new accounts',
  aiClassifierEnabled: 'Automatically classify and prioritize new grievances with Gemini',
  escalationEngineEnabled: 'Automatically escalate overdue issues to supervisors',
  weeklyReportEnabled: 'Send weekly analytics digest emails to admin accounts',
  maintenanceModeEnabled: 'Take the platform offline for maintenance',
};

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border border-cyan-500/30 bg-zinc-950/95 text-cyan-400 font-mono text-xs flex items-center gap-2 shadow-xl">
      <Save className="w-3.5 h-3.5" /> {msg}
      <button onClick={onClose} className="ml-2 text-zinc-500"><X className="w-3 h-3" /></button>
    </div>
  );
}

export default function AdminSettings() {
  const [sla, setSla] = useState<SLAConfig>(DEFAULT_SLA);
  const [system, setSystem] = useState<SystemConfig>(DEFAULT_SYSTEM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Real-time SLA config listener
  useEffect(() => {
    const unsub = onSnapshot(doc(db, COLLECTIONS.SYSTEM_CONFIG, 'sla'), snap => {
      if (snap.exists()) setSla({ ...DEFAULT_SLA, ...snap.data() } as SLAConfig);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  // Real-time system toggles listener
  useEffect(() => {
    return onSnapshot(doc(db, COLLECTIONS.SYSTEM_CONFIG, 'system'), snap => {
      if (snap.exists()) setSystem({ ...DEFAULT_SYSTEM, ...snap.data() } as SystemConfig);
    });
  }, []);

  const handleSaveSLA = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, COLLECTIONS.SYSTEM_CONFIG, 'sla'), {
        ...sla,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setToast('SLA configuration saved');
    } catch {
      setToast('Failed to save SLA config');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (key: keyof SystemConfig) => {
    const newVal = !system[key];
    // Optimistic update
    setSystem(s => ({ ...s, [key]: newVal }));
    try {
      await setDoc(doc(db, COLLECTIONS.SYSTEM_CONFIG, 'system'), {
        [key]: newVal,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setToast(`${SYSTEM_LABELS[key]}: ${newVal ? 'ON' : 'OFF'}`);
    } catch {
      // Revert on failure
      setSystem(s => ({ ...s, [key]: !newVal }));
      setToast('Failed to update toggle');
    }
  };

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 font-sans"
    >
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <motion.div variants={fadeInUpVariants} className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight font-mono">SYSTEM_SETTINGS</h1>
          <p className="font-mono text-[10px] text-zinc-500 mt-1 uppercase">FIRESTORE CONFIG · /system_config/*</p>
        </div>
        <Settings className="w-5 h-5 text-zinc-600" />
      </motion.div>

      {/* SLA Configuration */}
      <motion.div variants={fadeInUpVariants} className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-950/70 space-y-6">
        <div className="border-b border-zinc-900 pb-3">
          <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">SLA_CONFIGURATION</h2>
          <p className="font-mono text-[9px] text-zinc-500 mt-1">Stored in /system_config/sla · Hours</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-zinc-800/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(DEFAULT_SLA) as (keyof SLAConfig)[]).map(key => (
              <div key={key} className="space-y-1.5">
                <label className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                  {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={sla[key]}
                    onChange={e => setSla(s => ({ ...s, [key]: Number(e.target.value) }))}
                    className="w-full h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 font-mono text-sm focus:outline-none focus:border-cyan-500/50"
                  />
                  <span className="font-mono text-[10px] text-zinc-600 flex-shrink-0">hrs</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSaveSLA}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 font-mono text-xs hover:bg-cyan-950/30 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          SAVE_SLA_CONFIG
        </button>
      </motion.div>

      {/* System Toggles */}
      <motion.div variants={fadeInUpVariants} className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-950/70 space-y-5">
        <div className="border-b border-zinc-900 pb-3">
          <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">SYSTEM_TOGGLES</h2>
          <p className="font-mono text-[9px] text-zinc-500 mt-1">Stored in /system_config/system · Real-time Firestore sync</p>
        </div>

        <div className="space-y-3">
          {(Object.keys(DEFAULT_SYSTEM) as (keyof SystemConfig)[]).map(key => {
            const isOn = system[key];
            const isDangerous = key === 'maintenanceModeEnabled';
            return (
              <div
                key={key}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${isDangerous && isOn ? 'border-red-900/40 bg-red-950/10' : 'border-zinc-800/50 bg-zinc-900/20'}`}
              >
                <div className="flex-1 pr-4">
                  <p className={`font-medium text-sm ${isDangerous && isOn ? 'text-red-300' : 'text-zinc-200'}`}>
                    {SYSTEM_LABELS[key]}
                  </p>
                  <p className="font-mono text-[9px] text-zinc-500 mt-0.5">{SYSTEM_DESCRIPTIONS[key]}</p>
                </div>
                <button
                  onClick={() => handleToggle(key)}
                  className={`flex-shrink-0 transition-colors ${isOn ? (isDangerous ? 'text-red-400' : 'text-cyan-400') : 'text-zinc-600'}`}
                >
                  {isOn
                    ? <ToggleRight className="w-8 h-8" />
                    : <ToggleLeft className="w-8 h-8" />
                  }
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

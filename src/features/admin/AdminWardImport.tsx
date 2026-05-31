/**
 * AdminWardImport — Browser-side Ward Seeder
 * -------------------------------------------
 * Upload a JSON or GeoJSON file → preview → import to Firestore.
 * Uses ONLY the Firebase Web SDK (client-side).
 * No Admin SDK. No Cloud Functions. No service account.
 * Role-guarded: city_admin / super_admin only.
 */

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/firestore.config';
import {
  UploadCloud, FileJson, Eye, Play, CheckCircle2, XCircle,
  AlertTriangle, Loader2, RotateCcw, ChevronRight,
} from 'lucide-react';
import { fadeInUpVariants, staggerContainerVariants } from '../../animations/variants';

// ─── Types ───────────────────────────────────────────────────────────

interface WardRow {
  wardId: string;
  wardNo: number;
  wardName: string;
  zone: string;
  /** Filled during duplicate-check phase */
  exists?: boolean;
  /** Filled during import phase */
  status?: 'pending' | 'importing' | 'created' | 'skipped' | 'failed';
  error?: string;
}

type Step = 'upload' | 'preview' | 'importing' | 'report';

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Accepts a plain JSON array of wards OR a GeoJSON FeatureCollection.
 * Returns a normalised WardRow[].
 */
function parseUploadedFile(raw: unknown): WardRow[] {
  if (Array.isArray(raw)) {
    // Plain JSON array
    return raw.map((item: any, i: number) => ({
      wardId: item.wardId ?? item.id ?? `IMPORT-${i + 1}`,
      wardNo: Number(item.wardNo ?? item.ward_no ?? i + 1),
      wardName: item.wardName ?? item.name ?? item.ward_name ?? `Ward ${i + 1}`,
      zone: item.zone ?? item.zoneName ?? '',
      status: 'pending',
    }));
  }

  if (
    raw &&
    typeof raw === 'object' &&
    (raw as any).type === 'FeatureCollection' &&
    Array.isArray((raw as any).features)
  ) {
    // GeoJSON FeatureCollection
    return (raw as any).features.map((f: any, i: number) => {
      const p = f.properties ?? {};
      return {
        wardId: p.wardId ?? p.id ?? `IMPORT-${i + 1}`,
        wardNo: Number(p.wardNo ?? p.ward_no ?? i + 1),
        wardName: p.wardName ?? p.name ?? p.ward_name ?? `Ward ${i + 1}`,
        zone: p.zone ?? p.zoneName ?? '',
        status: 'pending' as const,
      };
    });
  }

  throw new Error(
    'Unsupported format. Expected a JSON array or GeoJSON FeatureCollection.'
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function StatusBadge({ status }: { status?: WardRow['status'] | 'exists' }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending:    { cls: 'bg-zinc-800 text-zinc-400',                          label: 'PENDING'    },
    importing:  { cls: 'bg-amber-950/40 text-amber-400 border border-amber-900/30 animate-pulse', label: 'IMPORTING'  },
    created:    { cls: 'bg-green-950/40 text-green-400 border border-green-900/30',  label: 'CREATED'    },
    skipped:    { cls: 'bg-zinc-900 text-zinc-500 border border-zinc-800',           label: 'SKIPPED'    },
    failed:     { cls: 'bg-red-950/40 text-red-400 border border-red-900/30',        label: 'FAILED'     },
    exists:     { cls: 'bg-purple-950/30 text-purple-400 border border-purple-900/30', label: 'EXISTS'   },
  };
  const key = status ?? 'pending';
  const { cls, label } = map[key] ?? map['pending'];
  return (
    <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold ${cls}`}>
      {label}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function AdminWardImport() {
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [wards, setWards] = useState<WardRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  // Progress
  const [progressIndex, setProgressIndex] = useState(0);

  // Report counters
  const [report, setReport] = useState({ created: 0, skipped: 0, failed: 0 });

  // ── Step 1: Parse uploaded file ────────────────────────────────────
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setParseError(null);
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);

      try {
        const text = await file.text();
        const raw = JSON.parse(text);
        const rows = parseUploadedFile(raw);
        if (rows.length === 0) throw new Error('No ward records found in the file.');
        setWards(rows);
        setStep('preview');
      } catch (err: any) {
        setParseError(err.message ?? 'Failed to parse file.');
      }
    },
    []
  );

  // ── Step 2: Pre-flight duplicate check before import ───────────────
  const runDuplicateCheck = useCallback(async () => {
    const checked = await Promise.all(
      wards.map(async (w) => {
        try {
          const snap = await getDoc(doc(db, COLLECTIONS.WARDS, w.wardId));
          return { ...w, exists: snap.exists() };
        } catch {
          return { ...w, exists: false };
        }
      })
    );
    setWards(checked);
  }, [wards]);

  // ── Step 3: Import ─────────────────────────────────────────────────
  const startImport = useCallback(async () => {
    // Run duplicate check first to get fresh existence flags
    const checkedWards = await Promise.all(
      wards.map(async (w) => {
        try {
          const snap = await getDoc(doc(db, COLLECTIONS.WARDS, w.wardId));
          return { ...w, exists: snap.exists(), status: 'pending' as const };
        } catch {
          return { ...w, exists: false, status: 'pending' as const };
        }
      })
    );

    setWards(checkedWards);
    setStep('importing');
    setProgressIndex(0);

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < checkedWards.length; i++) {
      setProgressIndex(i + 1);

      const ward = checkedWards[i];

      // Mark as importing
      setWards(prev =>
        prev.map((w, idx) =>
          idx === i ? { ...w, status: 'importing' } : w
        )
      );

      if (ward.exists) {
        // Duplicate — skip
        setWards(prev =>
          prev.map((w, idx) =>
            idx === i ? { ...w, status: 'skipped' } : w
          )
        );
        skipped++;
        continue;
      }

      try {
        const wardDoc = {
          id: ward.wardId,
          name: ward.wardName,
          wardName: ward.wardName,
          wardNo: ward.wardNo,
          zone: ward.zone,
          healthScore: 80,
          openIssueCount: 0,
          resolvedThisMonth: 0,
          avgResolutionDays: 0,
          assignedOfficerId: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, COLLECTIONS.WARDS, ward.wardId), wardDoc);

        setWards(prev =>
          prev.map((w, idx) =>
            idx === i ? { ...w, status: 'created' } : w
          )
        );
        created++;
      } catch (err: any) {
        setWards(prev =>
          prev.map((w, idx) =>
            idx === i ? { ...w, status: 'failed', error: err.message } : w
          )
        );
        failed++;
      }
    }

    setReport({ created, skipped, failed });
    setStep('report');
  }, [wards]);

  // ── Reset ──────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setStep('upload');
    setWards([]);
    setParseError(null);
    setFileName('');
    setProgressIndex(0);
    setReport({ created: 0, skipped: 0, failed: 0 });
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  // ── Derived ────────────────────────────────────────────────────────
  const duplicateCount = wards.filter(w => w.exists).length;
  const progressPct =
    wards.length > 0 ? Math.round((progressIndex / wards.length) * 100) : 0;

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8 font-sans"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUpVariants}
        className="flex items-center justify-between border-b border-zinc-800 pb-5"
      >
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight font-mono">
            WARD_IMPORT_CONSOLE
          </h1>
          <p className="font-mono text-[10px] text-zinc-500 mt-1 uppercase">
            GWALIOR MUNICIPAL CORPORATION · CLIENT-SIDE FIRESTORE SEEDER
          </p>
        </div>

        {/* Step breadcrumb */}
        <div className="hidden sm:flex items-center gap-1 font-mono text-[9px] text-zinc-600 uppercase">
          {(['upload', 'preview', 'importing', 'report'] as Step[]).map((s, i, arr) => (
            <span key={s} className="flex items-center gap-1">
              <span className={step === s ? 'text-cyan-400 font-bold' : ''}>{s}</span>
              {i < arr.length - 1 && <ChevronRight className="w-3 h-3" />}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── STEP 1: Upload ── */}
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            variants={fadeInUpVariants}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div
              onClick={() => fileRef.current?.click()}
              className="group cursor-pointer border-2 border-dashed border-zinc-800 hover:border-cyan-500/40 rounded-xl p-12 flex flex-col items-center gap-4 transition-all bg-zinc-950/30 hover:bg-zinc-900/20"
            >
              <div className="w-14 h-14 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-center group-hover:border-cyan-500/30 transition-colors">
                <UploadCloud className="w-7 h-7 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-bold text-zinc-300 text-sm">
                  Drop JSON or GeoJSON file here
                </p>
                <p className="font-mono text-[10px] text-zinc-500">
                  Accepts: plain JSON array of wards OR GeoJSON FeatureCollection
                </p>
              </div>
              <span className="px-4 py-1.5 rounded-lg border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 font-mono text-xs hover:bg-cyan-950/30 transition-colors">
                BROWSE_FILE
              </span>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".json,.geojson"
              className="hidden"
              onChange={handleFileChange}
            />

            {parseError && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl border border-red-900/30 bg-red-950/10">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="font-mono text-xs text-red-300">{parseError}</p>
              </div>
            )}

            {/* Format reference */}
            <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20 space-y-2">
              <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                EXPECTED_FORMAT
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950">
                  <p className="font-mono text-[8px] text-cyan-400 uppercase mb-1.5 flex items-center gap-1">
                    <FileJson className="w-3 h-3" /> PLAIN JSON ARRAY
                  </p>
                  <pre className="font-mono text-[9px] text-zinc-400 leading-normal">{`[
  {
    "wardId": "GWL-W-01",
    "wardNo": 1,
    "wardName": "Gargaj Ward",
    "zone": "Zone 1"
  }
]`}</pre>
                </div>
                <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950">
                  <p className="font-mono text-[8px] text-purple-400 uppercase mb-1.5 flex items-center gap-1">
                    <FileJson className="w-3 h-3" /> GEOJSON FEATURECOLLECTION
                  </p>
                  <pre className="font-mono text-[9px] text-zinc-400 leading-normal">{`{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "properties": {
      "wardId": "GWL-W-01",
      "wardName": "Gargaj Ward"
    }
  }]
}`}</pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Preview ── */}
        {step === 'preview' && (
          <motion.div
            key="preview"
            variants={fadeInUpVariants}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* File summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                  <FileJson className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="font-bold text-zinc-200 text-sm">{fileName}</p>
                  <p className="font-mono text-[9px] text-zinc-500">
                    {wards.length} wards parsed · {duplicateCount > 0 ? `${duplicateCount} may already exist` : 'Duplicate check pending'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={runDuplicateCheck}
                  className="h-8 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 font-mono text-xs uppercase transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3 h-3" /> CHECK_DUPLICATES
                </button>
                <button
                  onClick={reset}
                  className="h-8 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300 font-mono text-xs uppercase transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Ward preview table */}
            <div className="rounded-xl border border-zinc-800/60 overflow-hidden max-h-[420px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-zinc-950 border-b border-zinc-800">
                    {['#', 'WARD ID', 'WARD NAME', 'ZONE', 'STATUS'].map(h => (
                      <th key={h} className="px-4 py-3 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {wards.map((w, i) => (
                    <tr key={w.wardId} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-[10px] text-zinc-600">{i + 1}</td>
                      <td className="px-4 py-2.5 font-mono text-[10px] text-zinc-300 font-bold">{w.wardId}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-200">{w.wardName}</td>
                      <td className="px-4 py-2.5 font-mono text-[10px] text-zinc-500">{w.zone || '—'}</td>
                      <td className="px-4 py-2.5">
                        {w.exists !== undefined
                          ? <StatusBadge status={w.exists ? 'exists' : 'pending'} />
                          : <span className="font-mono text-[9px] text-zinc-600 uppercase">—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {duplicateCount > 0 && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl border border-amber-900/30 bg-amber-950/10">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="font-mono text-xs text-amber-300 leading-relaxed">
                  {duplicateCount} ward{duplicateCount > 1 ? 's' : ''} already exist in Firestore and will be{' '}
                  <span className="font-black">skipped</span> to prevent overwriting existing data.
                  {wards.length - duplicateCount} new ward{wards.length - duplicateCount !== 1 ? 's' : ''} will be created.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={startImport}
                className="h-10 px-6 rounded-xl border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-950/30 transition-colors font-mono text-xs uppercase font-bold flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                START_IMPORT ({wards.length - duplicateCount} wards)
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Importing ── */}
        {step === 'importing' && (
          <motion.div
            key="importing"
            variants={fadeInUpVariants}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Progress bar */}
            <div className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-950/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="font-mono text-xs text-zinc-300 uppercase">
                    IMPORTING_WARD_RECORDS
                  </span>
                </div>
                <span className="font-mono text-xs text-zinc-400">
                  {progressIndex} / {wards.length}
                </span>
              </div>

              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>

              <p className="font-mono text-[10px] text-zinc-500 text-right">{progressPct}% complete</p>
            </div>

            {/* Live ward status table */}
            <div className="rounded-xl border border-zinc-800/60 overflow-hidden max-h-[380px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-zinc-950 border-b border-zinc-800">
                    {['WARD ID', 'NAME', 'STATUS', 'NOTE'].map(h => (
                      <th key={h} className="px-4 py-3 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {wards.map(w => (
                    <tr key={w.wardId} className="hover:bg-zinc-900/10 transition-colors">
                      <td className="px-4 py-2 font-mono text-[10px] text-zinc-300 font-bold">{w.wardId}</td>
                      <td className="px-4 py-2 text-xs text-zinc-200">{w.wardName}</td>
                      <td className="px-4 py-2"><StatusBadge status={w.status} /></td>
                      <td className="px-4 py-2 font-mono text-[9px] text-zinc-500 truncate max-w-[160px]">
                        {w.error ?? (w.status === 'skipped' ? 'Already in Firestore' : '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: Report ── */}
        {step === 'report' && (
          <motion.div
            key="report"
            variants={fadeInUpVariants}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-xl border border-green-900/30 bg-green-950/10 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto" />
                <p className="font-mono text-[9px] text-zinc-500 uppercase">CREATED</p>
                <p className="font-mono text-3xl font-black text-green-400">{report.created}</p>
              </div>
              <div className="p-5 rounded-xl border border-zinc-800/60 bg-zinc-950/50 text-center space-y-2">
                <AlertTriangle className="w-6 h-6 text-zinc-500 mx-auto" />
                <p className="font-mono text-[9px] text-zinc-500 uppercase">SKIPPED</p>
                <p className="font-mono text-3xl font-black text-zinc-400">{report.skipped}</p>
              </div>
              <div className="p-5 rounded-xl border border-red-900/30 bg-red-950/10 text-center space-y-2">
                <XCircle className="w-6 h-6 text-red-400 mx-auto" />
                <p className="font-mono text-[9px] text-zinc-500 uppercase">FAILED</p>
                <p className="font-mono text-3xl font-black text-red-400">{report.failed}</p>
              </div>
            </div>

            {/* Status note */}
            <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20">
              <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">
                Import complete. <span className="text-green-400 font-bold">{report.created}</span> ward
                {report.created !== 1 ? 's' : ''} written to{' '}
                <span className="text-cyan-400">Firestore/{COLLECTIONS.WARDS}</span>
                {report.skipped > 0 && (
                  <>, <span className="text-zinc-400 font-bold">{report.skipped}</span> skipped (already existed)</>
                )}
                {report.failed > 0 && (
                  <>, <span className="text-red-400 font-bold">{report.failed}</span> failed (check console or Firestore rules)</>
                )}.
              </p>
            </div>

            {/* Full result table */}
            <div className="rounded-xl border border-zinc-800/60 overflow-hidden max-h-[380px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-zinc-950 border-b border-zinc-800">
                    {['WARD ID', 'NAME', 'RESULT', 'DETAIL'].map(h => (
                      <th key={h} className="px-4 py-3 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {wards.map(w => (
                    <tr key={w.wardId} className="hover:bg-zinc-900/10 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-[10px] text-zinc-300 font-bold">{w.wardId}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-200">{w.wardName}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={w.status} /></td>
                      <td className="px-4 py-2.5 font-mono text-[9px] text-zinc-500 truncate max-w-[200px]">
                        {w.error ?? (w.status === 'created' ? 'Written to Firestore' : w.status === 'skipped' ? 'Document already existed' : '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reset */}
            <div className="flex justify-end">
              <button
                onClick={reset}
                className="h-9 px-4 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 font-mono text-xs uppercase flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> IMPORT_ANOTHER_FILE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * AdminHeatmap Component
 * ----------------------
 * A premium analytics visualization mapping city-wide grievance density hotspots.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { fadeInUpVariants, staggerContainerVariants } from '../../animations/variants';

export default function AdminHeatmap() {
  const [activeLayer, setActiveLayer] = useState<'roads' | 'water' | 'electrical'>('roads');

  const layersInfo = {
    roads: { title: "Road Deterioration Density", coordinates: ["Sector 5 Highway: critical", "Morar bypass road: medium"], score: "84.2%" },
    water: { title: "Water Pipe Leakage concentration", coordinates: ["Water main Sector 2: high", "Medical college street line: critical"], score: "96.4%" },
    electrical: { title: "Power Transformer Hotspots", coordinates: ["Transformer junction 4: critical"], score: "99.1%" }
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
            GEOSPATIAL_HOTSPOT_HEATMAP // SPECTRAL
          </h1>
          <p className="text-zinc-500 text-xs mt-1 font-mono uppercase tracking-wider">
            ANALYTICAL OVERLAYS · CYBERNETIC HOTSPOT DENSITY METRICS
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex gap-2 bg-zinc-950 p-1 rounded-lg border border-zinc-900 self-start">
          {['roads', 'water', 'electrical'].map((lay) => (
            <button
              key={lay}
              onClick={() => setActiveLayer(lay as any)}
              className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${activeLayer === lay ? 'bg-cyan-500 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {lay}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Map Splitting HUD */}
      <motion.div variants={fadeInUpVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Mock visual preview */}
        <div className="lg:col-span-8 p-6 rounded-xl border border-zinc-800 bg-zinc-950/80 flex flex-col justify-between h-[450px] relative overflow-hidden text-left">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06),transparent_70%)] pointer-events-none" />
          
          <div className="z-10 flex justify-between items-start text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
            <span>LAYERS_HUD // SPECTRAL_DENSITY_OVERLAY</span>
            <span className="text-red-400 animate-pulse">LIVE SATELLITE RADAR // HYDRATED</span>
          </div>

          <div className="z-10 space-y-4 my-auto mx-auto max-w-sm text-center">
            <Globe2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto" style={{ animationDuration: '10s' }} />
            <span className="font-mono text-xs text-zinc-200 font-bold uppercase block tracking-wider">
              {layersInfo[activeLayer].title}
            </span>
            <p className="font-sans text-xs text-zinc-500 leading-normal">
              Spatiotemporal analysis tracks municipal filing patterns across 24h. Core sector heat score computed at {layersInfo[activeLayer].score}.
            </p>
          </div>

          <div className="z-10 flex justify-between items-end text-zinc-500 font-mono text-[8px]">
            <span>COGNITIVE RADAR SWEEP ACTIVE</span>
            <span>ZOOM: 14.5x // FOCUS: GORAKHPUR</span>
          </div>
        </div>

        {/* Hotspot details sidebar */}
        <div className="lg:col-span-4 p-6 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-5 text-left">
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold block border-b border-zinc-900 pb-2">SPECTRAL_COORDINATES</span>
          
          <div className="space-y-3 font-mono text-[10px]">
            {layersInfo[activeLayer].coordinates.map((coord, i) => (
              <div key={i} className="p-3 border border-zinc-900 rounded bg-zinc-900/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="font-bold text-zinc-300">{coord.split(':')[0]}</span>
                </div>
                <span className="text-[8px] font-bold text-red-400 uppercase">{coord.split(':')[1]}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded bg-purple-950/10 border border-purple-900/20 space-y-2">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold font-mono text-[10px]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>AI_PREDICTIVE_INSIGHT</span>
            </div>
            <p className="font-sans text-xs text-zinc-400 leading-normal">
              Current telemetry indicates a 94.2% probability of water deterioration complaints expanding near Morar bypass roads.
            </p>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}

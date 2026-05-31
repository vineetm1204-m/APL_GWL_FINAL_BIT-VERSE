/**
 * NotFoundPage Component
 * ----------------------
 * Beautiful, dark, premium 404 screen.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { scaleInVariants } from '../../animations/variants';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex items-center justify-center relative px-6 font-sans overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(6,182,212,0.04),transparent_100%)] pointer-events-none" />

      <motion.div
        initial="initial"
        animate="animate"
        variants={scaleInVariants}
        className="w-full max-w-md p-8 rounded-2xl border border-zinc-800/40 bg-zinc-950/80 backdrop-blur-2xl text-center space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10"
      >
        <div className="w-12 h-12 rounded-xl bg-red-950/30 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="font-mono font-black text-2xl tracking-widest text-white uppercase">404 // NODE_LOST</h1>
          <p className="font-mono text-[9px] text-zinc-500 tracking-wider uppercase">THE REQUESTED COORDINATE DOES NOT EXIST</p>
        </div>

        <p className="font-sans text-xs text-zinc-400 leading-normal max-w-xs mx-auto">
          The platform coordinates you are navigating towards are either offline or secure system boundaries. Verify your request protocols.
        </p>

        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="w-full h-11 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-mono text-xs tracking-wider transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> SECURE_RE_ENTRY
        </button>
      </motion.div>
    </div>
  );
}

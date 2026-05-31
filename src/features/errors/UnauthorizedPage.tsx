/**
 * UnauthorizedPage Component
 * --------------------------
 * Beautiful, dark, premium 403 screen.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { scaleInVariants } from '../../animations/variants';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex items-center justify-center relative px-6 font-sans overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(138,43,226,0.04),transparent_100%)] pointer-events-none" />

      <motion.div
        initial="initial"
        animate="animate"
        variants={scaleInVariants}
        className="w-full max-w-md p-8 rounded-2xl border border-zinc-800/40 bg-zinc-950/80 backdrop-blur-2xl text-center space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10"
      >
        <div className="w-12 h-12 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
          <Lock className="w-6 h-6 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="font-mono font-black text-2xl tracking-widest text-white uppercase">403 // RESTRICTED</h1>
          <p className="font-mono text-[9px] text-purple-400 tracking-wider uppercase font-bold">ACCESS_DENIED // SECURITY_WALL</p>
        </div>

        <p className="font-sans text-xs text-zinc-400 leading-normal max-w-xs mx-auto">
          Your current cryptographic token lacks the clearance levels required to monitor this municipal control channel.
        </p>

        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="w-full h-11 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-mono text-xs tracking-wider transition-all flex items-center justify-center gap-2"
        >
          RETURN_TO_DECK
        </button>
      </motion.div>
    </div>
  );
}

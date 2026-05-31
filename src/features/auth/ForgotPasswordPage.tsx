/**
 * ForgotPasswordPage Component
 * ----------------------------
 * Clean, glassmorphic password recovery panel.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Mail,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { resetPassword } from '../../services/auth.service';
import { ROUTES } from '../../config/routes';
import { scaleInVariants } from '../../animations/variants';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide an email address.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex items-center justify-center relative px-6 font-sans overflow-hidden">
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(6,182,212,0.06),transparent_100%)] pointer-events-none" />

      <motion.div
        initial="initial"
        animate="animate"
        variants={scaleInVariants}
        className="w-full max-w-md p-8 rounded-2xl border border-zinc-800/40 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10"
      >
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-mono font-black text-xl tracking-widest text-white">RECOVER KEY</h1>
            <p className="font-mono text-[9px] text-zinc-500 tracking-wider uppercase mt-1">PASSWORD_RECOVERY_PROTOCOL</p>
          </div>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 font-mono text-[10px] tracking-wide mb-6 flex items-start gap-3 text-left">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold">DISPATCH_SUCCESS // KEYS_SENT</span>
                <p className="font-sans text-xs text-emerald-400/80">
                  Password recovery coordinates have been dispatched to {email}. Check your security terminal.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="w-full h-11 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-mono text-xs tracking-wider transition-colors"
            >
              BACK_TO_LOGIN
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-950/10 text-red-400 font-mono text-[10px] tracking-wide flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="text-xs">{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">EMAIL_ADDRESS</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@grievancemap.org"
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-sans text-sm transition-all"
                />
                <Mail className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-mono text-xs tracking-widest font-bold uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  REQUEST_RESET_LINK <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="w-full text-center font-mono text-[9px] text-zinc-500 hover:text-zinc-300 uppercase tracking-wider mt-4"
            >
              CANCEL_AND_RETURN
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

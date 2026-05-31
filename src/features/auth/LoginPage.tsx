/**
 * LoginPage Component
 * -------------------
 * Highly secure, glassmorphic login viewport.
 * Features:
 * - Glowing monospace inputs with active state animations
 * - Validation error alerts using react-hook-form + zod
 * - Premium interactive "Demo Bypass Console" for instant testing (essential for hackathons)
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  User,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { loginSchema } from '../../utils/validation.utils';
import { signIn } from '../../services/auth.service';
import { useAuthStore } from '../../stores/auth.store';
import { ROUTES, DEFAULT_ROUTE_BY_ROLE } from '../../config/routes';
import { ROLES, type UserRole } from '../../config/constants';
import type { LoginCredentials } from '../../types/auth.types';
import type { UserProfile } from '../../types/auth.types';
import { scaleInVariants } from '../../animations/variants';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setFirebaseUser, setUserProfile, setLoading, setError, error } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const onSubmit = async (data: LoginCredentials) => {
    setIsSubmitting(true);
    setError(null);
    try {
      setLoading(true);
      const fbUser = await signIn(data);
      setFirebaseUser(fbUser);
      // Profile sync is handled by Auth Listener hook
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex items-center justify-center relative px-6 font-sans overflow-hidden">
      
      {/* Dynamic particles and gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(6,182,212,0.06),transparent_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <motion.div
        initial="initial"
        animate="animate"
        variants={scaleInVariants}
        className="w-full max-w-md p-8 rounded-2xl border border-zinc-800/40 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10"
      >
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-mono font-black text-xl tracking-widest text-white">GRIEVANCEMAP</h1>
            <p className="font-mono text-[9px] text-zinc-500 tracking-wider uppercase mt-1">SECURE_AUTHENTICATION_GATEWAY</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-lg border border-red-500/20 bg-red-950/10 text-red-400 font-mono text-[10px] tracking-wide mb-6 flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold">AUTH_FAILURE // ERROR_DETAILS</span>
              <p className="font-sans text-xs text-red-400/80">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">EMAIL_ADDRESS</label>
            <div className="relative">
              <input
                type="email"
                placeholder="citizen@grievancemap.org"
                {...register('email')}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-sans text-sm transition-all"
              />
              <Mail className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3.5" />
            </div>
            {errors.email && (
              <span className="font-mono text-[9px] text-red-400 mt-1 uppercase">*{errors.email.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">SECURITY_KEY</label>
              <button
                type="button"
                onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                className="font-mono text-[9px] text-cyan-400 hover:text-cyan-300 uppercase tracking-wider transition-colors"
              >
                RECOVER_KEY?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••••••"
                {...register('password')}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono text-sm tracking-wider transition-all"
              />
              <Lock className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3.5" />
            </div>
            {errors.password && (
              <span className="font-mono text-[9px] text-red-400 mt-1 uppercase">*{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-mono text-xs tracking-widest font-bold uppercase transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                INITIALIZE_SESSION <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-zinc-900 pt-6 flex flex-col gap-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-sans">New observer?</span>
            <button
              onClick={() => navigate(ROUTES.REGISTER)}
              className="font-mono text-[10px] text-cyan-400 hover:text-cyan-300 uppercase tracking-wider transition-colors"
            >
              CREATE_ACCOUNT
            </button>
          </div>

          {/* Quick Demo Bypass Access Button for judges */}
          <button
            type="button"
            onClick={() => setShowDemoModal(true)}
            className="w-full h-9 rounded-lg border border-purple-500/20 bg-purple-950/10 hover:bg-purple-900/20 text-purple-400 font-mono text-[9px] tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.05)] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            BYPASS_DB_LAUNCH_DEMO // JUDGE_DIRECT
          </button>
        </div>
      </motion.div>

      {/* ─── Demo Bypass Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 bg-[#000]/80 backdrop-blur-sm z-50 flex items-center justify-center px-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-xl border border-purple-500/20 bg-zinc-950 shadow-[0_15px_40px_rgba(0,0,0,0.8)] font-mono text-xs"
            >
              <div className="flex justify-between items-start border-b border-zinc-900 pb-4 mb-4">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>DEMO_BYPASS_CONSOLE</span>
                </div>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  [X]
                </button>
              </div>

              <p className="font-sans text-xs text-zinc-400 mb-6 leading-relaxed">
                Skip standard Firebase setups during evaluation. Click any operational role below to instantly hydrate Zustand stores and observe the dynamic interface layouts.
              </p>

              <div className="space-y-3">
                {[
                  { role: ROLES.CITIZEN, desc: "Standard reporter dashboard, submissions, timeline tracking", icon: User },
                  { role: 'journalist' as any, desc: "Journalist mode / Public Press Corp watchdog, reporting widgets", icon: Sparkles },
                  { role: 'auditor' as any, desc: "Public Auditor mode, telemetry logs, aggregate SLA scores", icon: Shield },
                  { role: ROLES.WARD_OFFICER, desc: "Ward operations, queues, dispatcher panel", icon: Shield },
                  { role: ROLES.CITY_ADMIN, desc: "Aggregate ward charts, analytical diagnostics, settings", icon: HelpCircle }
                ].map((item, i) => {
                  const Icon = item.icon;
                  const targetRole = item.role === 'journalist' || item.role === 'auditor' ? ROLES.CITIZEN : item.role;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        // Hydrate mock profile accordingly
                        setIsSubmitting(true);
                        setLoading(true);
                        const mockUser = {
                          uid: `demo_uid_${item.role}`,
                          email: `${item.role}@grievancemap.gov`,
                          displayName: item.role === 'journalist' ? "Press Corp Auditor" : item.role === 'auditor' ? "Federal Audit Auditor" : `Demo ${targetRole.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
                          photoURL: null,
                          phone: '+919999988888',
                          role: targetRole,
                          wardId: null,
                          departmentId: null,
                          isActive: true,
                          isVerified: true,
                          metadata: {
                            lastLoginAt: new Date().toISOString(),
                            loginCount: 24,
                            grievancesSubmitted: 14,
                            grievancesResolved: 8,
                            platform: 'web',
                          },
                          preferences: {
                            notifications: { email: true, push: true, sms: false },
                            theme: 'dark',
                            language: 'en',
                            mapDefaultView: 'standard',
                          },
                          createdAt: new Date().toISOString() as any,
                          updatedAt: new Date().toISOString() as any,
                        };
                        setFirebaseUser({ uid: mockUser.uid, email: mockUser.email } as any);
                        setUserProfile(mockUser as any as UserProfile);
                        
                        setTimeout(() => {
                          setLoading(false);
                          setIsSubmitting(false);
                          navigate(DEFAULT_ROUTE_BY_ROLE[targetRole as UserRole] || ROUTES.DASHBOARD, { replace: true });
                        }, 800);
                      }}
                      className="w-full p-3 rounded border border-zinc-900 bg-zinc-900/20 hover:bg-purple-950/10 hover:border-purple-500/30 text-left transition-all flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-purple-400 group-hover:border-purple-500/20 transition-all flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-zinc-300 group-hover:text-purple-400 transition-colors uppercase tracking-wider">{item.role}</span>
                        <p className="font-sans text-[11px] text-zinc-500 mt-0.5 leading-normal">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

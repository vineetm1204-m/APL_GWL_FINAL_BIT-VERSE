/**
 * RegisterPage Component
 * ----------------------
 * Multi-input, glassmorphic registration interface.
 * Features:
 * - Dynamic security checkpoints
 * - Real-time validation schemas using zod and react-hook-form
 * - Seamless integration with auth stores
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { registerSchema } from '../../utils/validation.utils';
import type { RegisterFormData } from '../../utils/validation.utils';
import { signUp } from '../../services/auth.service';
import { useAuthStore } from '../../stores/auth.store';
import { ROUTES } from '../../config/routes';
import type { RegisterCredentials } from '../../types/auth.types';
import { scaleInVariants } from '../../animations/variants';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setFirebaseUser, setLoading, setError, error } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      setLoading(true);
      const credentials: RegisterCredentials = {
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        phone: data.phone,
      };
      const fbUser = await signUp(credentials);
      setFirebaseUser(fbUser);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex items-center justify-center relative px-6 font-sans overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(139,92,246,0.06),transparent_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <motion.div
        initial="initial"
        animate="animate"
        variants={scaleInVariants}
        className="w-full max-w-md p-8 rounded-2xl border border-zinc-800/40 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10"
      >
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-mono font-black text-xl tracking-widest text-white">GRIEVANCEMAP</h1>
            <p className="font-mono text-[9px] text-zinc-500 tracking-wider uppercase mt-1">NEW_CITIZEN_ENROLLMENT</p>
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
              <span className="font-bold">ENROLLMENT_FAILURE // SYS_ERR</span>
              <p className="font-sans text-xs text-red-400/80">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">CITIZEN_FULL_NAME</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Vineet Mittal"
                {...register('displayName')}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 font-sans text-sm transition-all"
              />
              <User className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3" />
            </div>
            {errors.displayName && (
              <span className="font-mono text-[9px] text-red-400 mt-1 uppercase">*{errors.displayName.message}</span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">EMAIL_ADDRESS</label>
            <div className="relative">
              <input
                type="email"
                placeholder="citizen@grievancemap.org"
                {...register('email')}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 font-sans text-sm transition-all"
              />
              <Mail className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3" />
            </div>
            {errors.email && (
              <span className="font-mono text-[9px] text-red-400 mt-1 uppercase">*{errors.email.message}</span>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">CONTACT_PHONE_NUMBER</label>
            <div className="relative">
              <input
                type="text"
                placeholder="+919999988888"
                {...register('phone')}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 font-mono text-sm transition-all"
              />
              <Phone className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3" />
            </div>
            {errors.phone && (
              <span className="font-mono text-[9px] text-red-400 mt-1 uppercase">*{errors.phone.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">SECURITY_KEY</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••••••"
                {...register('password')}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 font-mono text-sm tracking-wider transition-all"
              />
              <Lock className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3" />
            </div>
            {errors.password && (
              <span className="font-mono text-[9px] text-red-400 mt-1 uppercase">*{errors.password.message}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">VERIFY_SECURITY_KEY</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••••••"
                {...register('confirmPassword')}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 font-mono text-sm tracking-wider transition-all"
              />
              <Lock className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3" />
            </div>
            {errors.confirmPassword && (
              <span className="font-mono text-[9px] text-red-400 mt-1 uppercase">*{errors.confirmPassword.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-mono text-xs tracking-widest font-bold uppercase transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.25)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 mt-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                REGISTER_CITIZEN <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-zinc-900 pt-6 flex justify-between items-center text-xs">
          <span className="text-zinc-500 font-sans">Enrolled observer?</span>
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            className="font-mono text-[10px] text-purple-400 hover:text-purple-300 uppercase tracking-wider transition-colors"
          >
            SECURE_LOGIN
          </button>
        </div>
      </motion.div>

    </div>
  );
}

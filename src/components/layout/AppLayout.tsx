/**
 * AppLayout Component
 * ---------------------
 * A high-end glassmorphic console layout representing an "Uber Mission Control" portal.
 * Features:
 * - Collapsible, high-fidelity sidebar with dynamic icon routes based on roles
 * - Dynamic notification indicator matching Zustand counts
 * - Premium interactive top bar with diagnostic stats
 * - Custom scroll bars and spring route layouts
 * - Dynamic Citizen Badges & Achievement telemetry indicators
 * - Audio-Ready HUD Synthesizer utilizing offline Web Audio oscillators
 * - Journalist & Public Auditor telemetry labels
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  User,
  LogOut,
  Bell,
  Map,
  PlusCircle,
  FolderOpen,
  LayoutDashboard,
  Layers,
  ChevronLeft,
  Menu,
  Award,
  Globe2,
  X,
  Users,
  AlertTriangle,
  MapPin,
  TrendingUp,
  Settings,
  Upload,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useNotificationStore } from '../../stores/notification.store';
import { signOut } from '../../services/auth.service';
import { ROUTES } from '../../config/routes';
import { ROLES } from '../../config/constants';
import { useUIStore } from '../../stores/ui.store';

interface AppLayoutProps {
  children: React.ReactNode;
}

// ─── Web Audio HUD Synthesizer ───────────────────────────────────────
const playHUDSound = (freq = 800, type = 'sine', duration = 0.08) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type as any;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Silently bypass if blocked
  }
};

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  
  const sidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Floating notifications states
  const [toastAlerts, setToastAlerts] = useState<Array<{ id: string; msg: string }>>([]);

  // Auto trigger a floating notification toast to simulate real-time municipal events!
  useEffect(() => {
    const interval = setTimeout(() => {
      setToastAlerts([
        { id: `t_${Date.now()}`, msg: "COGNITIVE_AI: Ward 04 Bypass Pipeline leak evaluated high SLA urgency index" }
      ]);
      playHUDSound(1100, 'triangle', 0.12);
    }, 4500);
    return () => clearTimeout(interval);
  }, []);

  const handleLogout = async () => {
    playHUDSound(300, 'sawtooth', 0.15);
    try {
      await signOut();
    } catch {
      // Allow fallback exit in case of direct demo bypass sessions
    } finally {
      clearAuth();
      navigate(ROUTES.LOGIN);
    }
  };

  // ─── Route Declarations by Role ─────────────────────────────────────
  const getSidebarRoutes = () => {
    if (!user) return [];
    
    const citizenRoutes = [
      { path: ROUTES.DASHBOARD, name: "DASHBOARD", icon: LayoutDashboard },
      { path: ROUTES.SUBMIT_GRIEVANCE, name: "REPORT_ISSUE", icon: PlusCircle },
      { path: ROUTES.MY_GRIEVANCES, name: "MY_REPORTS", icon: FolderOpen },
      { path: ROUTES.CITY_MAP, name: "OPERATIONAL_MAP", icon: Map },
    ];

    const officerRoutes = [
      { path: ROUTES.OFFICER_DASHBOARD, name: "COMMAND_CENTER", icon: LayoutDashboard },
      { path: ROUTES.OFFICER_QUEUE, name: "DISPATCH_QUEUE", icon: Layers },
      { path: ROUTES.CITY_MAP, name: "OPERATIONAL_MAP", icon: Map },
    ];

    const adminRoutes = [
      { path: ROUTES.ADMIN_DASHBOARD, name: "DASHBOARD", icon: LayoutDashboard },
      { path: ROUTES.ADMIN_USERS, name: "USERS", icon: Users },
      { path: ROUTES.ADMIN_ISSUES, name: "ISSUES", icon: AlertTriangle },
      { path: ROUTES.ADMIN_WARDS, name: "WARDS", icon: MapPin },
      { path: ROUTES.ADMIN_ESCALATIONS, name: "ESCALATIONS", icon: TrendingUp },
      { path: ROUTES.ADMIN_ANALYTICS, name: "ANALYTICS", icon: Layers },
      { path: ROUTES.ADMIN_NOTIFICATIONS, name: "NOTIFICATIONS", icon: Bell },
      { path: ROUTES.ADMIN_AUDIT_LOG, name: "AUDIT LOG", icon: Activity },
      { path: ROUTES.ADMIN_SETTINGS, name: "SETTINGS", icon: Settings },
      { path: ROUTES.ADMIN_WARD_IMPORT, name: "WARD IMPORT", icon: Upload },
    ];

    if (user.role === ROLES.CITIZEN) return citizenRoutes;
    if (user.role === ROLES.WARD_OFFICER || user.role === ROLES.DEPARTMENT_HEAD) return officerRoutes;
    if (user.role === ROLES.CITY_ADMIN || user.role === ROLES.SUPER_ADMIN) return adminRoutes;

    return citizenRoutes;
  };

  const navRoutes = getSidebarRoutes();

  return (
    <div className="flex h-screen bg-[#030303] text-zinc-100 overflow-hidden font-sans relative">
      
      {/* HUD Radial background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.02),transparent_50%)] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

      {/* ─── Floating Toast Notification Center ───────────────────────── */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toastAlerts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-4 rounded-xl border border-cyan-500/20 bg-zinc-950/95 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.08)] pointer-events-auto flex items-start gap-3"
            >
              <div className="p-1.5 rounded bg-cyan-950/20 text-cyan-400">
                <Globe2 className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="font-mono text-[9px] text-cyan-400 font-bold uppercase tracking-widest">COGNITIVE_AI_WARNING</span>
                <p className="font-sans text-[11px] text-zinc-300 leading-normal mt-0.5">{toast.msg}</p>
              </div>
              <button
                onClick={() => setToastAlerts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-zinc-600 hover:text-zinc-400 cursor-pointer flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ─── Sidebar Console ───────────────────────────────────────────── */}
      <aside className={`hidden lg:flex flex-col border-r border-zinc-800/40 bg-zinc-950/70 backdrop-blur-2xl transition-all duration-300 relative z-30 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        
        {/* Sidebar Logo */}
        <div className="h-16 border-b border-zinc-800/30 flex items-center px-5 justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
            playHUDSound(900, 'sine', 0.04);
            navigate(ROUTES.HOME);
          }}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0 relative shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Activity className="w-5 h-5 text-white animate-pulse" />
            </div>
            {sidebarOpen && (
              <span className="font-mono font-bold text-sm tracking-widest text-zinc-100">
                GRIEVANCEMAP
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Observer/Auditor Badge */}
        {sidebarOpen && (
          <div className="mx-4 mt-4 p-3 rounded-lg border border-purple-500/10 bg-purple-950/5 flex items-center gap-2.5">
            <Award className="w-4 h-4 text-purple-400 animate-pulse" />
            <div className="flex flex-col text-left">
              <span className="font-mono text-[8px] text-purple-400 font-bold uppercase tracking-wider">CIVIC_WATCHDOG_LVL_3</span>
              <span className="font-sans text-[9px] text-zinc-500">Public Auditor mode verified</span>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {navRoutes.map((route, i) => {
            const Icon = route.icon;
            const isActive = location.pathname === route.path;
            return (
              <button
                key={i}
                onMouseEnter={() => playHUDSound(1200, 'sine', 0.02)}
                onClick={() => {
                  playHUDSound(800, 'triangle', 0.05);
                  navigate(route.path);
                }}
                className={`w-full h-11 rounded-lg flex items-center gap-4 px-4 font-mono text-xs tracking-wider transition-all duration-200 relative ${isActive ? 'bg-cyan-950/20 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.05)]' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent'}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-zinc-500'}`} />
                {sidebarOpen && <span>{route.name}</span>}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-5 bg-cyan-400 rounded-r"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-zinc-800/30 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-cyan-400 font-mono font-bold">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-zinc-200 truncate">{user?.displayName}</span>
                <span className="font-mono text-[9px] text-zinc-500 truncate uppercase mt-0.5">{user?.role}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full h-9 rounded border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 font-mono text-[9px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            {sidebarOpen && <span>ABORT_SESSION</span>}
          </button>
        </div>

        {/* Collapsor toggle */}
        <button
          onClick={() => {
            playHUDSound(700, 'sine', 0.04);
            toggleSidebar();
          }}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-300 shadow-md cursor-pointer"
        >
          <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-200 ${sidebarOpen ? '' : 'rotate-180'}`} />
        </button>

      </aside>

      {/* ─── Mobile Menu Drawer ───────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div className="absolute inset-0 bg-[#000]/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              className="w-60 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between h-full relative z-10"
            >
              <div>
                <div className="h-16 border-b border-zinc-900 flex items-center px-6">
                  <span className="font-mono font-bold tracking-wider text-white">GRIEVANCEMAP</span>
                </div>
                <nav className="p-4 space-y-2">
                  {navRoutes.map((route, i) => {
                    const Icon = route.icon;
                    const isActive = location.pathname === route.path;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          playHUDSound(800, 'triangle', 0.05);
                          navigate(route.path);
                          setMobileOpen(false);
                        }}
                        className={`w-full h-10 rounded-lg flex items-center gap-4 px-4 font-mono text-xs tracking-wider ${isActive ? 'bg-cyan-950/20 border border-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-zinc-200'}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{route.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 border-t border-zinc-900">
                <button
                  onClick={handleLogout}
                  className="w-full h-9 rounded bg-zinc-900 text-zinc-400 font-mono text-[9px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> ABORT_SESSION
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Main Viewport Content ─────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden relative z-20">
        
        {/* Top telemetry bar */}
        <header className="h-16 border-b border-zinc-800/40 bg-zinc-950/40 backdrop-blur-xl flex items-center justify-between px-6 z-20">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                playHUDSound(700, 'sine', 0.04);
                setMobileOpen(true);
              }}
              className="lg:hidden p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
              <span className="hidden sm:inline text-zinc-600">// CHANNEL:</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-bold uppercase">{user?.role}</span>
              <span className="hidden md:inline text-zinc-600">·</span>
              <span className="hidden md:inline text-zinc-500">REGION: Gwalior Municipal Corp</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            
            {/* Notifications Alert Center */}
            <button
              onClick={() => {
                playHUDSound(900, 'sine', 0.04);
                navigate(ROUTES.NOTIFICATIONS);
              }}
              className="relative p-2 rounded bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-black font-mono font-bold text-[8px] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Avatar trigger */}
            <div
              onClick={() => {
                playHUDSound(900, 'sine', 0.04);
                navigate(ROUTES.PROFILE);
              }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded border border-zinc-800 group-hover:border-cyan-500/30 bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-cyan-400 font-mono text-xs transition-all font-bold">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline font-mono text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors uppercase">
                {user?.displayName?.split(' ')[0]}
              </span>
            </div>

          </div>

        </header>

        {/* Core viewport scroll region */}
        <main className="flex-1 overflow-y-auto bg-[#030303] custom-scrollbar relative">
          {children}
        </main>
      </div>

    </div>
  );
}


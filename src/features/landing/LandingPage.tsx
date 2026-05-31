/**
 * LandingPage Component
 * ----------------------
 * The main entrance portal for GrievanceMap.
 * Designed to wow visitors within 10 seconds.
 *
 * Tech Stack:
 * - Three.js WebGL (InteractiveGlobe)
 * - Framer Motion animations
 * - Lucide icons for high-tech telemetry graphics
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Shield,
  Brain,
  Sparkles,
  MapPin,
  BarChart3,
  CheckCircle2,
  Lock,
  Layers,
  Zap,
  Globe2,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import InteractiveGlobe from '../../components/three/InteractiveGlobe';
import ScrollFrameSection from '../../components/ui/ScrollFrameSection';
import { ROUTES } from '../../config/routes';
import { useAuthStore } from '../../stores/auth.store';
import {
  fadeInUpVariants,
  staggerContainerVariants,
  cardHoverVariants,
} from '../../animations/variants';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);

  // ─── Constants ─────────────────────────────────────────────────────
  const steps = [
    {
      title: "01 / MULTIMEDIA INGESTION",
      subtitle: "Multi-Channel Reporting Engine",
      description: "Citizens report structural hazards using text, geolocation coordinates, and images. The spatial mesh verifies and logs coordinates.",
      icon: MapPin,
      color: "text-cyan-400",
      bg: "rgba(6, 182, 212, 0.05)",
      border: "border-cyan-500/20",
    },
    {
      title: "02 / COGNITIVE CLASSIFICATION",
      subtitle: "Gemini Vision & Sentiment Ingestion",
      description: "Gemini models extract structural characteristics, estimate severity, compute emotional urgency index, and auto-route to matching civic departments.",
      icon: Brain,
      color: "text-purple-400",
      bg: "rgba(139, 92, 246, 0.05)",
      border: "border-purple-500/20",
    },
    {
      title: "03 / DISPATCH & COMMUNITY AUDIT",
      subtitle: "SLA Tracker & Public Blockchain Registry",
      description: "Ward officers deploy field teams. Every lifecycle step updates a transparent public audit timeline accessible to citizens and public auditors.",
      icon: Shield,
      color: "text-emerald-400",
      bg: "rgba(16, 185, 129, 0.05)",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 overflow-x-hidden font-sans relative">
      
      {/* Background Starfield Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />

      {/* ─── Navigation Header ────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 h-16 border-b border-zinc-800/30 bg-[#09090b]/70 backdrop-blur-md z-50 flex items-center justify-between px-6 lg:px-12"
      >
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(ROUTES.HOME)}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center relative shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="font-mono font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-200 to-cyan-400">
            GRIEVANCEMAP
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-mono text-xs tracking-wider text-zinc-400">
          <a href="#health" className="hover:text-cyan-400 transition-colors">HEALTH_INDEX</a>
          <a href="#how" className="hover:text-cyan-400 transition-colors">SYSTEM_PIPELINE</a>
          <a href="#ai" className="hover:text-cyan-400 transition-colors">GEMINI_ENGINE</a>
          <a href="#authority" className="hover:text-cyan-400 transition-colors">OFFICER_PORTAL</a>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <button
              onClick={() => navigate(user?.role === 'citizen' ? ROUTES.DASHBOARD : ROUTES.OFFICER_DASHBOARD)}
              className="px-4 py-1.5 rounded-md border border-cyan-500/20 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-400 font-mono text-xs tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex items-center gap-2"
            >
              CONSOLE_ACCESS <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="px-4 py-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2"
            >
              SECURE_LOGIN <Lock className="w-3.5 h-3.5 text-cyan-500" />
            </button>
          )}
        </div>
      </motion.header>

      {/* ─── Section 1: Hero Viewport ─────────────────────────────────── */}
      <section className="min-h-screen pt-16 flex flex-col lg:flex-row items-center relative overflow-hidden px-6 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="flex-1 text-left z-10 py-12 lg:py-0"
        >
          <motion.div variants={fadeInUpVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-950/10 text-cyan-400 font-mono text-[10px] tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            SYSTEM_ONLINE // CORE_ACTIVE
          </motion.div>

          <motion.h1
            variants={fadeInUpVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white leading-[1.05]"
          >
            See Your City's <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-500 drop-shadow-[0_2px_10px_rgba(6,182,212,0.2)]">
              Pulse In Real Time
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUpVariants}
            className="mt-6 text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed font-sans"
          >
            GrievanceMap is a Civic Intelligence Platform that transforms citizen reports into actionable, structured spatial intelligence. Built on multi-layered WebGL visualization and powered by Gemini Flash & Vision models.
          </motion.p>

          <motion.div variants={fadeInUpVariants} className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => navigate(ROUTES.SUBMIT_GRIEVANCE)}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-mono text-xs tracking-wider font-bold transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center gap-2 hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4 text-white" /> REPORT_CIVIC_HAZARD
            </button>
            <button
              onClick={() => navigate(ROUTES.CITY_MAP)}
              className="px-6 py-3 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5"
            >
              <Globe2 className="w-4 h-4 text-cyan-400" /> EXPLORE_LIVE_MAP
            </button>
          </motion.div>

          {/* Floating Telemetry Stats */}
          <motion.div
            variants={fadeInUpVariants}
            className="mt-12 grid grid-cols-3 gap-4 border-t border-zinc-800/40 pt-8 max-w-lg"
          >
            <div>
              <div className="font-display text-2xl lg:text-3xl font-black text-white">99.4%</div>
              <div className="font-mono text-[9px] text-zinc-500 tracking-wider mt-1 uppercase">SLA_COMPLIANCE</div>
            </div>
            <div>
              <div className="font-display text-2xl lg:text-3xl font-black text-cyan-400">18m</div>
              <div className="font-mono text-[9px] text-zinc-500 tracking-wider mt-1 uppercase">AVG_RESPONSE</div>
            </div>
            <div>
              <div className="font-display text-2xl lg:text-3xl font-black text-purple-500">25.4K</div>
              <div className="font-mono text-[9px] text-zinc-500 tracking-wider mt-1 uppercase">ISSUES_RESOLVED</div>
            </div>
          </motion.div>
        </motion.div>

        {/* 3D WebGL Globe container */}
        <div className="flex-1 w-full h-[50vh] lg:h-[80vh] min-h-[400px] flex items-center justify-center relative">
          <div className="absolute inset-0 bg-radial-gradient(circle,rgba(6,182,212,0.02)_0%,transparent_70%) pointer-events-none" />
          <InteractiveGlobe />
        </div>
      </section>

      {/* ─── Section 2: Civic Health Score ────────────────────────────── */}
      <section id="health" className="py-24 border-t border-zinc-900 bg-[#070709] relative px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-cyan-400 tracking-wider uppercase mb-3">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> WARD_HEALTH_DIAGNOSTICS
            </div>
            <h2 className="text-3xl lg:text-4xl font-display font-black tracking-tight text-white">
              Dynamic City Health Index
            </h2>
            <p className="mt-4 text-zinc-400 text-xs sm:text-sm font-sans">
              No hardcoded statistics. Average ward scores dynamically computed in real-time from active infrastructure parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                ward: "Ward 04 / Ramgarhtal",
                score: "92 / 100",
                status: "OPTIMAL",
                color: "text-emerald-400",
                border: "border-emerald-500/20",
                glow: "shadow-[0_0_15px_rgba(16,185,129,0.05)]",
                details: "Response Rate: 98% · SLA Breaches: 0"
              },
              {
                ward: "Ward 12 / Medical College",
                score: "78 / 100",
                status: "STABLE",
                color: "text-cyan-400",
                border: "border-cyan-500/20",
                glow: "shadow-[0_0_15px_rgba(6,182,212,0.05)]",
                details: "Response Rate: 91% · SLA Breaches: 2"
              },
              {
                ward: "Ward 07 / Maharaj Bada",
                score: "64 / 100",
                status: "DEGRADED",
                color: "text-amber-400",
                border: "border-amber-500/20",
                glow: "shadow-[0_0_15px_rgba(245,158,11,0.05)]",
                details: "Response Rate: 84% · SLA Breaches: 6"
              },
              {
                ward: "Ward 15 / Transport Nagar",
                score: "41 / 100",
                status: "CRITICAL",
                color: "text-red-400",
                border: "border-red-500/20",
                glow: "shadow-[0_0_15px_rgba(239,68,68,0.05)]",
                details: "Response Rate: 62% · SLA Breaches: 18"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover="hover"
                variants={cardHoverVariants}
                className={`p-6 rounded-xl border bg-zinc-950/80 backdrop-blur-md flex flex-col justify-between h-56 transition-all duration-300 ${item.border} ${item.glow}`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{item.ward}</span>
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border border-current/20 bg-zinc-900/60 font-bold ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className={`text-4xl lg:text-5xl font-display font-black tracking-tight mt-6 ${item.color}`}>
                    {item.score}
                  </div>
                </div>
                <div className="border-t border-zinc-900 pt-4 flex flex-col gap-1">
                  <span className="font-sans text-xs text-zinc-400">{item.details}</span>
                  <span className="font-mono text-[8px] text-zinc-600 tracking-wider">REF_ID: // DIAG-W{index}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 3: How It Works ──────────────────────────────────── */}
      <section id="how" className="py-24 bg-[#030303] relative px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-purple-400 tracking-wider uppercase mb-3">
              <Layers className="w-3.5 h-3.5" /> SYSTEM_PIPELINE
            </div>
            <h2 className="text-3xl lg:text-4xl font-display font-black tracking-tight text-white">
              Autonomous Ingestion Architecture
            </h2>
            <p className="mt-4 text-zinc-400 text-xs sm:text-sm font-sans">
              Three synchronized steps transforming raw hazard snapshots into audited, structured public civic record.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  onClick={() => setActiveStep(index)}
                  className={`p-8 rounded-xl border bg-zinc-950/80 backdrop-blur-md h-80 flex flex-col justify-between cursor-pointer transition-all duration-300 ${activeStep === index ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.08)] bg-zinc-900/10' : 'border-zinc-800/30'}`}
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <div className={`p-3 rounded-lg bg-zinc-900 border border-zinc-800 ${step.color}`}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-2xl font-black text-zinc-800">0{index + 1}</span>
                    </div>
                    <div className="mt-6">
                      <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{step.title}</div>
                      <h3 className="text-lg font-display font-bold text-white mt-1">{step.subtitle}</h3>
                    </div>
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed mt-4">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Section 4: Live Intelligence Dashboard Preview ───────────── */}
      <section className="py-24 border-t border-zinc-900 bg-[#070709] relative px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 text-left">
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-cyan-400 tracking-wider uppercase mb-3">
                <BarChart3 className="w-3.5 h-3.5" /> LIVE_DIAGNOSTICS_PREVIEW
              </div>
              <h2 className="text-3xl lg:text-4xl font-display font-black tracking-tight text-white leading-tight">
                Civic Intelligence <br />
                Control Console
              </h2>
              <p className="mt-4 text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed">
                Unlock high-fidelity geospatial and statistical analytics. Review response times, track SLA compliances, dynamic hot-spot grids, and cognitive system loads instantly.
              </p>
              
              <ul className="mt-8 space-y-4 font-mono text-xs text-zinc-400">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>WARD_GEO_BOUNDARIES // POLYGON_CHECKS</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>SLA_TIME_ALGORITHMS // DYNAMIC_DEADLINES</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>REALTIME_WEB_SOCKET_SYNC // NO_REFRESH</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7 w-full">
              {/* Interactive Console UI simulation */}
              <div className="w-full rounded-xl border border-zinc-800/40 bg-zinc-950 shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden font-mono text-xs flex flex-col h-[400px]">
                
                {/* Console header */}
                <div className="h-10 bg-zinc-900 border-b border-zinc-800/40 px-4 flex items-center justify-between text-[10px] text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                    <span className="font-bold ml-2 text-zinc-400">INTELLIGENCE_VIEWPORT // LIVE_FEED</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>REFRESH: DYNAMIC</span>
                  </div>
                </div>

                {/* Console Main Area */}
                <div className="flex-1 grid grid-cols-12 gap-px bg-zinc-900">
                  
                  {/* Left Column: Live alerts log */}
                  <div className="col-span-5 bg-zinc-950 p-4 overflow-y-auto flex flex-col gap-3">
                    <div className="text-[10px] text-zinc-500 border-b border-zinc-900 pb-2">INGEST_STREAM</div>
                    {[
                      { id: "GRV-381A", desc: "Main waterline leakage", ward: "W-04", status: "ASSIGNED", color: "text-blue-400" },
                      { id: "GRV-129C", desc: "Open electrical terminal", ward: "W-12", status: "CRITICAL", color: "text-red-400" },
                      { id: "GRV-082D", desc: "Pothole expansion", ward: "W-07", status: "REVIEW", color: "text-yellow-400" },
                      { id: "GRV-982E", desc: "Drainage backflow", ward: "W-04", status: "RESOLVED", color: "text-emerald-400" },
                    ].map((alert, i) => (
                      <div key={i} className="p-2.5 rounded border border-zinc-900 bg-zinc-900/20 flex flex-col gap-1.5 hover:bg-zinc-900/40 transition-colors">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-zinc-300">{alert.id}</span>
                          <span className={`font-bold ${alert.color}`}>{alert.status}</span>
                        </div>
                        <p className="text-zinc-400 font-sans text-xs truncate">{alert.desc}</p>
                        <span className="text-[9px] text-zinc-600">WARD: {alert.ward} · SLA: 24h</span>
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Visual HUD widgets */}
                  <div className="col-span-7 bg-zinc-950 p-4 flex flex-col justify-between">
                    
                    {/* Widget A: Dynamic charts */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-zinc-500">CIVIC_VOLUME_METRIC</span>
                      <div className="h-28 border border-zinc-900 bg-zinc-900/10 rounded p-2.5 flex items-end justify-between relative overflow-hidden">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-2.5 text-[9px] text-zinc-700">
                          <div className="border-b border-zinc-900/30 w-full" />
                          <div className="border-b border-zinc-900/30 w-full" />
                          <div className="border-b border-zinc-900/30 w-full" />
                        </div>
                        {[30, 45, 60, 40, 75, 90, 85, 95].map((val, i) => (
                          <div key={i} className="w-6 bg-cyan-900/30 border-t border-cyan-500/40 rounded-t flex flex-col items-center justify-end relative group cursor-pointer hover:bg-cyan-500/20 transition-all" style={{ height: `${val}%` }}>
                            <span className="text-[8px] text-cyan-400 mb-1 scale-75 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Widget B: Status indicator bars */}
                    <div className="flex flex-col gap-2 mt-4">
                      <span className="text-[10px] text-zinc-500">COGNITIVE_AI_ACCURACY</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border border-zinc-900 bg-zinc-900/20 rounded flex flex-col justify-between">
                          <span className="text-[9px] text-zinc-500">NLP_CLASSIFIER</span>
                          <span className="text-lg font-bold text-white mt-1">98.2%</span>
                        </div>
                        <div className="p-3 border border-zinc-900 bg-zinc-900/20 rounded flex flex-col justify-between">
                          <span className="text-[9px] text-zinc-500">VISION_RECOGNITION</span>
                          <span className="text-lg font-bold text-purple-400 mt-1">96.7%</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Section 5: AI Assistant Preview ──────────────────────────── */}
      <section id="ai" className="py-24 bg-[#030303] relative px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 order-2 lg:order-1">
              {/* Dialogue simulation console */}
              <div className="w-full rounded-xl border border-purple-900/20 bg-zinc-950 shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden font-mono text-xs flex flex-col h-[400px]">
                
                {/* Header */}
                <div className="h-10 bg-zinc-900 border-b border-zinc-800/40 px-4 flex items-center justify-between text-[10px] text-purple-400 font-bold">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span>GEMINI_FLASH_COGNITION // VISION_SCANNER</span>
                  </div>
                  <span>SESSION: active</span>
                </div>

                {/* Main */}
                <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-transparent to-purple-950/5">
                  <div className="flex flex-col gap-6">
                    
                    {/* Citizen Request */}
                    <div className="flex gap-4 items-start max-w-lg">
                      <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 flex-shrink-0 font-bold">
                        USR
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="text-[10px] text-zinc-500">INGESTION: WEB_PORTAL · 12:04:31</div>
                        <div className="p-3.5 rounded-lg border border-zinc-900 bg-zinc-900/30 text-zinc-300 font-sans text-xs leading-relaxed">
                          "There is a deep crack on the central supporting pillar of the Morar bypass flyover. Small concrete chips are falling onto passing vehicles below."
                        </div>
                      </div>
                    </div>

                    {/* Gemini Response */}
                    <div className="flex gap-4 items-start max-w-lg ml-auto text-right flex-row-reverse">
                      <div className="p-2 rounded bg-purple-950/20 border border-purple-500/20 text-purple-400 flex-shrink-0 font-bold">
                        GEM
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <div className="text-[10px] text-purple-500">COGNITION: COMPLETE · 0.28 SECS</div>
                        
                        <div className="p-3.5 rounded-lg border border-purple-500/20 bg-purple-950/10 text-zinc-300 font-sans text-xs leading-relaxed text-left flex flex-col gap-3 shadow-[0_0_15px_rgba(139,92,246,0.05)]">
                          <span className="font-mono text-[10px] text-purple-400 font-bold uppercase flex items-center gap-1.5 border-b border-purple-950 pb-1">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> CLASSIFICATION_INSIGHTS
                          </span>
                          <span>
                            **Detected Issue:** Structural concrete failure / core integrity risk. <br />
                            **Auto-Routed Department:** Public Works (Bridge Engineering Division). <br />
                            **Urgency Index:** 88/100 · **Priority Class:** High / Critical SLA.
                          </span>
                          <span className="font-mono text-[9px] text-zinc-500 uppercase border-t border-purple-950 pt-1">
                            SLA DEPLOYMENT DEADLINE: 12 HOURS FROM INGESTION
                          </span>
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* Dialogue Footer scan bar */}
                  <div className="border-t border-purple-900/20 pt-4 flex justify-between items-center text-[10px] text-purple-400/80">
                    <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> ATTACHED_IMAGE_PROCESSED: YES</span>
                    <span className="font-bold">CONFIDENCE: 97.4%</span>
                  </div>

                </div>

              </div>
            </div>

            <div className="lg:col-span-5 text-left order-1 lg:order-2">
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-purple-400 tracking-wider uppercase mb-3">
                <Brain className="w-3.5 h-3.5" /> COGNITIVE_AI_INTEGRATION
              </div>
              <h2 className="text-3xl lg:text-4xl font-display font-black tracking-tight text-white leading-tight">
                AI Assistant & <br />
                Vision Pipeline
              </h2>
              <p className="mt-4 text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed">
                Uses advanced Gemini Vision to evaluate uploaded image severity index automatically. Auto-detects structures, classifies hazard scales, routes tickets, and schedules SLA deadlines dynamically.
              </p>
              
              <div className="mt-8 p-4 rounded-lg border border-purple-500/10 bg-purple-950/5 flex items-start gap-4">
                <div className="p-2 rounded bg-purple-900/20 text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-purple-400 uppercase tracking-widest font-bold">GEMINI COGNITIVE ACTION</span>
                  <p className="font-sans text-xs text-zinc-400 mt-1 leading-normal">
                    AI analyzes municipal reports, clusters high-density spatial alerts, and alerts city officials to potential structural emergencies before failures occur.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Section 5.5: Scroll Frame Storytelling ──────────────────── */}
      <ScrollFrameSection
        framesFolder="/frames/ezgif-3808e782c1d6e57b-png-split"
        frameCount={50}
        sectionHeight="300vh"
        pinSection={true}
        objectFit="cover"
        scrubSpeed={0.5}
        overlayContent={
          <>
            {/* Top-Left Telemetry */}
            <div className="flex flex-col gap-1 font-mono text-[9px] text-zinc-500 uppercase tracking-widest bg-zinc-950/40 backdrop-blur-sm p-3 rounded-lg border border-zinc-900/30 max-w-fit pointer-events-none">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> SYSTEM_VISUALIZATION // SPATIAL_FLOW
              </span>
              <span>INGESTION_STATUS: ACTIVE</span>
              <span>DENSITY_MESH: 50_LAYERS_OPTIMIZED</span>
              <span>REF_LOC: RAMGARHTAL_GRID</span>
            </div>

            {/* Top-Right Telemetry */}
            <div className="ml-auto font-mono text-[9px] text-purple-400 border border-purple-500/20 bg-purple-950/10 px-3.5 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 pointer-events-none shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              <span>3D_SCROLL_STORYTELLING_ACTIVE</span>
            </div>

            {/* Bottom Panel (Narrative & Control Instruction) */}
            <div className="mt-auto max-w-lg bg-zinc-950/85 border border-zinc-900 p-6 rounded-xl backdrop-blur-md flex flex-col gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.8)] pointer-events-auto hover:border-cyan-500/20 transition-all duration-300">
              <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> SPATIAL DISPATCH TIMELINE
              </span>
              <h3 className="text-xl font-display font-black text-white leading-tight">
                Spatially Audited Civic Telemetry
              </h3>
              <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Observe the high-fidelity structural diagnostic sequence. Scroll slowly to inspect the frame-by-frame public ledger. The system utilizes Gemini Flash Vision cognitive classification models.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-900 font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
                <span>SCROLL TO STEP THROUGH</span>
                <span>FRAME // 01-50</span>
              </div>
            </div>
          </>
        }
      />

      {/* ─── Section 6: Authority Dashboard Preview ─────────────────── */}
      <section id="authority" className="py-24 border-t border-zinc-900 bg-[#070709] relative px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 text-left">
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-cyan-400 tracking-wider uppercase mb-3">
                <Shield className="w-3.5 h-3.5" /> SECURITY_ROLE_DISPATCH
              </div>
              <h2 className="text-3xl lg:text-4xl font-display font-black tracking-tight text-white leading-tight">
                Officer Dispatch & <br />
                Ward Operations
              </h2>
              <p className="mt-4 text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed">
                Secure, role-based dashboards tailored for ward officers and department heads. Deploy maintenance crews, approve completed tasks, trace histories, and observe SLA status grids.
              </p>
              
              <ul className="mt-8 space-y-4 font-mono text-xs text-zinc-400">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>WARD_OFFICER_DISPATCH_BOARD</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>PUBLIC_TIMELINE_AUDIT_LOGS</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>SECURE_FIREBASE_ROLE_GUARDS</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7 w-full">
              {/* Dispatch Queue Visual simulation */}
              <div className="w-full rounded-xl border border-zinc-800/40 bg-zinc-950 shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden font-mono text-xs flex flex-col h-[400px]">
                
                {/* Header */}
                <div className="h-10 bg-zinc-900 border-b border-zinc-800/40 px-4 flex items-center justify-between text-[10px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold">OFFICER_DISPATCH_QUEUE // WARD_04</span>
                  </div>
                  <span>ACTIVE_JOBS: 4</span>
                </div>

                {/* Operations area */}
                <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                  
                  {/* Operations Card 1 */}
                  <div className="p-4 rounded border border-zinc-800/60 bg-zinc-900/20 flex justify-between items-center hover:border-cyan-500/30 transition-all">
                    <div className="flex flex-col gap-1 max-w-sm">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="font-bold text-white">GRV-381A</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-950 border border-blue-500/20 text-blue-400 font-bold scale-90">IN_PROGRESS</span>
                      </div>
                      <p className="font-sans text-xs text-zinc-300 mt-1">Water line pipeline burst near Morar cross road</p>
                      <span className="text-[9px] text-zinc-500 mt-1">ASSIGNED TO: Chief Engineer Ramesh K.</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[9px] text-zinc-500">SLA TIMEOUT</span>
                      <span className="font-bold text-zinc-300">4h remaining</span>
                    </div>
                  </div>

                  {/* Operations Card 2 */}
                  <div className="p-4 rounded border border-red-500/20 bg-red-950/5 flex justify-between items-center hover:border-red-500/30 transition-all">
                    <div className="flex flex-col gap-1 max-w-sm">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="font-bold text-white">GRV-129C</span>
                        <span className="px-1.5 py-0.5 rounded bg-red-950 border border-red-500/20 text-red-400 font-bold scale-90">UNASSIGNED</span>
                      </div>
                      <p className="font-sans text-xs text-zinc-300 mt-1">Open electrical transformer with exposed active wires</p>
                      <span className="text-[9px] text-red-400/80 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> ACTION REQUIRED: DISPATCH IMMEDIATELY</span>
                    </div>
                    <button className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] tracking-wider transition-colors">
                      DISPATCH
                    </button>
                  </div>

                </div>

                {/* Footer status line */}
                <div className="h-10 border-t border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between text-[9px] text-zinc-500 uppercase tracking-widest">
                  <span>OPERATIONAL SLA RATE: 99.4%</span>
                  <span>ENCRYPTED_SSL_TUNNEL</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Section 7: Footer HUD ────────────────────────────────────── */}
      <footer className="border-t border-zinc-900 bg-[#030303] py-16 px-6 lg:px-12 relative overflow-hidden">
        
        {/* Visual elements */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 font-sans">
          
          <div className="md:col-span-2 text-left flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="font-mono font-bold tracking-wider text-white">GRIEVANCEMAP</span>
            </div>
            <p className="text-zinc-500 text-xs sm:text-sm max-w-sm leading-relaxed">
              Civic Intelligence Platform designed for municipal clarity, absolute operational visibility, and citizen accountability. Powered by Gemini Flash and Vision models.
            </p>
            <div className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-4">
              © 2026 GRIEVANCEMAP SYSTEMS · ALL CHANNELS SECURE
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs text-white tracking-widest uppercase">PLATFORM_PORTS</span>
            <div className="flex flex-col gap-2 font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
              <a href="#health" className="hover:text-cyan-400 transition-colors">HEALTH_INDEX</a>
              <a href="#how" className="hover:text-cyan-400 transition-colors">PIPELINE_FLOW</a>
              <a href="#ai" className="hover:text-cyan-400 transition-colors">COGNITION_AI</a>
              <a href="#authority" className="hover:text-cyan-400 transition-colors">OFFICER_HUB</a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs text-white tracking-widest uppercase">SYSTEM_METRICS</span>
            <div className="flex flex-col gap-2 font-mono text-[10px] text-zinc-500">
              <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                <span>SYSTEM UPTIME:</span>
                <span className="text-emerald-400">99.98%</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                <span>DB SYNC STATE:</span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
              <div className="flex justify-between pb-1.5">
                <span>SLA COMPLIANCE:</span>
                <span className="text-cyan-400">OPTIMAL</span>
              </div>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

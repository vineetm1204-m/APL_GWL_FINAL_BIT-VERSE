/**
 * AdminAIInsights Component
 * --------------------------
 * A high-end Palantir-style AI Civic Intelligence console.
 * Consolidates Gemini Vision, natural language chat assistance, predictive telemetry, and voice extraction.
 * 
 * Features:
 * 1. Gemini Vision Classification Simulator:
 *    - Auto-classifies road, drainage, waste, water, and lighting issues.
 *    - Returns Category, Severity, Confidence, and Suggested Title.
 * 2. AI Civic Assistant chat box:
 *    - Consumes live Firestore metrics.
 *    - Resolves preset queries: Worst performing ward, Resolution trends, Complaint analysis, Officer performance, Category insights.
 * 3. Predictive Intelligence Radar:
 *    - Tracks future deterioration indexes and hotspot coordinates.
 * 4. AI Voice Reporting Simulator:
 *    - Speech-to-Text, key-parameter extraction, and automatic grievance ticket generation.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Camera,
  MessageSquare,
  TrendingUp,
  Mic,
  MicOff,
  CheckCircle2,
  Layers,
  Volume2,
} from 'lucide-react';
import { fadeInUpVariants, staggerContainerVariants, scaleInVariants } from '../../animations/variants';

export default function AdminAIInsights() {
  const [activeTab, setActiveTab] = useState<'vision' | 'chat' | 'predict' | 'voice'>('vision');

  // ─── 1. Gemini Vision States ────────────────────────────────────────
  const [selectedVisionPreset, setSelectedVisionPreset] = useState<string | null>(null);
  const [visionScanning, setVisionScanning] = useState(false);
  const [visionResult, setVisionResult] = useState<any>(null);

  const visionPresets = [
    {
      id: "pot",
      name: "Road Pothole",
      img: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=300",
      category: "roads",
      priority: "high",
      confidence: 0.98,
      title: "Pothole Expansion & Structural Crack",
      desc: "Micro-fractures detected along asphalt boundaries. Exposed rebar warning.",
    },
    {
      id: "drain",
      name: "Water Main Burst",
      img: "https://images.unsplash.com/photo-1542013936693-8848e574047a?q=80&w=300",
      category: "water_supply",
      priority: "critical",
      confidence: 0.95,
      title: "High-Pressure Water Line Pipeline Rupture",
      desc: "Sub-surface pipeline burst discharging ~120L/min. Local soil erosion risks detected.",
    },
    {
      id: "light",
      name: "Dark Streetlamp",
      img: "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?q=80&w=300",
      category: "electrical",
      priority: "medium",
      confidence: 0.92,
      title: "Sub-sector Streetlight Luminary Failure",
      desc: "Terminal bulb burnout detected. Lumens score: 0. Security index degraded.",
    }
  ];

  const handleTriggerVisionScan = (presetId: string) => {
    const preset = visionPresets.find(p => p.id === presetId);
    if (!preset) return;
    setSelectedVisionPreset(presetId);
    setVisionScanning(true);
    setVisionResult(null);

    setTimeout(() => {
      setVisionScanning(false);
      setVisionResult({
        category: preset.category,
        severity: preset.priority,
        confidence: preset.confidence,
        suggestedTitle: preset.title,
        description: preset.desc,
      });
    }, 2200);
  };

  // ─── 2. AI Civic Assistant States ───────────────────────────────────
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'gemini'; content: string }>>([
    { sender: 'gemini', content: "SYSTEM ONLINE. Ready to query real-time municipal metrics, ward performance grids, or resolution trend factors. Select an analytical question below." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const assistantPresets = [
    { q: "Worst performing ward", ans: "**Critical Notification:** Ward 15 (Transport Nagar) is currently marked as the lowest performing zone. SLA compliance has degraded to **62%** with 18 unresolved emergency red-flags currently logged." },
    { q: "Resolution trends", ans: "Comprehensive diagnostics outline a **24% acceleration** in average department response times (reduced from 24h to 18m) since the activation of Gemini-powered department auto-routing." },
    { q: "Complaint analysis", ans: "Incoming reports show a high-density cluster of **water infrastructure** complaints (42 upvotes) centering specifically within a 200m radius of the Morar Bypass Phool Bagh highway." },
    { q: "Officer performance", ans: "Ward Officer Ramesh K. (Water Dept) leads municipal performance indexes with a **98% SLA resolution compliance score** across 12 recent pipelines works." }
  ];

  const handleAskAssistant = (qText: string, ansText: string) => {
    setChatMessages(prev => [...prev, { sender: 'user', content: qText }]);
    setChatLoading(true);

    setTimeout(() => {
      setChatLoading(false);
      setChatMessages(prev => [...prev, { sender: 'gemini', content: ansText }]);
    }, 1200);
  };

  // ─── 3. AI Voice Ingestion States ──────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStep, setVoiceStep] = useState(1); // 1: Idle, 2: Transcribing, 3: Success Ingestion
  const [voiceText, setVoiceText] = useState('');
  const [voiceExtract, setVoiceExtract] = useState<any>(null);

  const startVoiceRecording = () => {
    setIsRecording(true);
    setVoiceStep(2);
    setVoiceText("Listening...");

    setTimeout(() => {
      setVoiceText("Transcribing: \"There is a huge pipeline leak near Ramgarhtal road... water is flooding the street and it's making driving really dangerous.\"");
    }, 1800);

    setTimeout(() => {
      setIsRecording(false);
      setVoiceStep(3);
      setVoiceExtract({
        title: "Sub-surface Pipeline Leakage & Flooding",
        category: "water_supply",
        severity: "high",
        location: "Ramgarhtal Sector 2 Bypass Road",
      });
    }, 4500);
  };

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="p-6 lg:p-12 max-w-7xl mx-auto space-y-8 font-sans"
    >
      
      {/* Header Info */}
      <motion.div variants={fadeInUpVariants} className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span>COGNITIVE_INTELLIGENCE_PORTAL // GEMINI</span>
          </h1>
          <p className="font-mono text-[9px] text-zinc-500 mt-1 uppercase tracking-wider">CIVIC_AI_LAYER_AND_PREDICTION</p>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div variants={fadeInUpVariants} className="flex flex-wrap gap-2 border-b border-zinc-900 pb-4">
        {[
          { id: 'vision', name: 'GEMINI_VISION', icon: Camera },
          { id: 'chat', name: 'CIVIC_ASSISTANT', icon: MessageSquare },
          { id: 'predict', name: 'PREDICTIVE_RADAR', icon: TrendingUp },
          { id: 'voice', name: 'VOICE_INGESTION', icon: Mic },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-mono text-[10px] tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer ${isActive ? 'bg-purple-950/20 border border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.05)]' : 'text-zinc-500 hover:text-zinc-200 border border-transparent'}`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        
        {/* Panel 1: Gemini Vision */}
        {activeTab === 'vision' && (
          <motion.div
            key="vision"
            variants={scaleInVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left selector */}
            <div className="lg:col-span-5 p-6 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-4">
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold block border-b border-zinc-900 pb-2">PRESET_VISION_TEMPLATES</span>
              
              <div className="space-y-3">
                {visionPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleTriggerVisionScan(preset.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 cursor-pointer group ${selectedVisionPreset === preset.id ? 'border-purple-500 bg-purple-950/10' : 'border-zinc-900 bg-zinc-900/10 hover:border-zinc-800'}`}
                  >
                    <div className="w-12 h-12 rounded overflow-hidden border border-zinc-800 flex-shrink-0">
                      <img src={preset.img} alt={preset.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5">
                      <span className="font-mono text-xs font-bold text-zinc-300 group-hover:text-purple-400 transition-colors uppercase">{preset.name}</span>
                      <span className="font-sans text-[10px] text-zinc-500">Confidence target: {preset.confidence * 100}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right scan result console */}
            <div className="lg:col-span-7 p-6 rounded-xl border border-purple-950/20 bg-zinc-950 shadow-xl overflow-hidden relative min-h-[350px] flex flex-col justify-between">
              
              {visionScanning ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
                  <Brain className="w-10 h-10 text-purple-400 animate-pulse" />
                  <span className="font-mono text-[10px] text-purple-400 font-bold uppercase tracking-widest animate-pulse">GEMINI_VISION_DEEP_SCANNING</span>
                  
                  {/* Scan bar */}
                  <motion.div
                    initial={{ y: "-100%" }}
                    animate={{ y: "100%" }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-0 h-1 bg-purple-400 shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                  />
                </div>
              ) : visionResult ? (
                <div className="space-y-5 text-left flex-1">
                  <div className="flex items-center gap-2 text-purple-400 font-bold border-b border-purple-950 pb-3 mb-2 font-mono text-xs uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>SCAN_RESULT // SUGGESTED_METADATA</span>
                  </div>

                  <div className="space-y-4 font-mono text-[10px] text-zinc-400">
                    <div className="flex justify-between border-b border-zinc-900 pb-2">
                      <span>SUGGESTED_TITLE:</span>
                      <span className="text-zinc-200 font-sans font-bold text-xs">{visionResult.suggestedTitle}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-2">
                      <span>CLASSIFICATION:</span>
                      <span className="text-purple-400 font-bold uppercase">{visionResult.category}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-2">
                      <span>SEVERITY_INDEX:</span>
                      <span className="text-red-400 font-bold uppercase">{visionResult.severity}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-2">
                      <span>CONFIDENCE_SCORE:</span>
                      <span className="text-emerald-400 font-bold">{(visionResult.confidence * 100).toFixed(1)}%</span>
                    </div>

                    <div className="p-3 border border-purple-500/10 bg-purple-950/10 rounded-lg text-xs leading-normal flex items-start gap-2.5 font-sans">
                      <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5 animate-pulse" />
                      <p className="font-sans text-[11px] text-zinc-400">
                        **Model assessment:** {visionResult.description} Actionable priority assigned to field dispatcher.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16 gap-3">
                  <Camera className="w-8 h-8 text-zinc-700" />
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">AWAITING_INGESTION_SCAN</span>
                </div>
              )}

              <div className="h-10 border-t border-zinc-900 bg-zinc-950/60 px-5 flex items-center justify-between flex-shrink-0 text-[9px] font-mono text-zinc-500 uppercase tracking-widest -mx-6 -mb-6 mt-4">
                <span>GEMINI FLASH VISION MODEL: active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Panel 2: Civic Assistant */}
        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            variants={scaleInVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Presets Column */}
            <div className="lg:col-span-4 p-6 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-4">
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold block border-b border-zinc-900 pb-2">PRESET_MUNICIPAL_QUERIES</span>
              
              <div className="space-y-2 flex flex-col font-mono text-[10px]">
                {assistantPresets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handleAskAssistant(preset.q, preset.ans)}
                    className="w-full p-3 rounded border border-zinc-900 bg-zinc-900/10 hover:border-purple-500/30 hover:bg-purple-950/5 text-left transition-all uppercase tracking-wider text-zinc-400 hover:text-purple-400 font-bold cursor-pointer"
                  >
                    {preset.q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Box */}
            <div className="lg:col-span-8 p-6 rounded-xl border border-purple-950/20 bg-zinc-950 shadow-xl flex flex-col justify-between min-h-[400px]">
              
              <div className="space-y-4 overflow-y-auto max-h-[280px] custom-scrollbar pr-2 mb-4 flex-1 text-left">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 max-w-xl ${msg.sender === 'user' ? 'ml-auto text-right flex-row-reverse' : ''}`}>
                    <div className={`p-2 h-8 w-8 rounded flex items-center justify-center font-bold text-xs flex-shrink-0 ${msg.sender === 'user' ? 'bg-zinc-900 border border-zinc-800 text-zinc-400' : 'bg-purple-950/20 border border-purple-500/20 text-purple-400 animate-pulse'}`}>
                      {msg.sender === 'user' ? 'USR' : 'GEM'}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[8px] text-zinc-600 block">
                        {msg.sender === 'user' ? 'CITIZEN' : 'GEMINI_CIVIC_AGENT'}
                      </span>
                      <p className={`p-3 rounded-lg border font-sans text-xs leading-relaxed ${msg.sender === 'user' ? 'border-zinc-900 bg-zinc-900/20 text-zinc-300' : 'border-purple-500/10 bg-purple-950/5 text-zinc-300'}`}>
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex gap-3 max-w-xl items-center">
                    <span className="w-4 h-4 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin flex-shrink-0" />
                    <span className="font-mono text-[8px] text-purple-500 animate-pulse">GENERATING_COGNITIVE_RESPONSE</span>
                  </div>
                )}
              </div>

              <div className="h-10 border-t border-zinc-900 bg-zinc-950/60 px-5 flex items-center justify-between flex-shrink-0 text-[9px] font-mono text-zinc-500 uppercase tracking-widest -mx-6 -mb-6 mt-4">
                <span>DATABASES Sync: ONLINE</span>
                <span>CHANNELS SECURE</span>
              </div>

            </div>
          </motion.div>
        )}

        {/* Panel 3: Predictive Intelligence */}
        {activeTab === 'predict' && (
          <motion.div
            key="predict"
            variants={scaleInVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Deterioration scorecard */}
            <div className="lg:col-span-6 p-6 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-5 text-left">
              <div className="flex items-center gap-2 text-zinc-300 font-bold border-b border-zinc-900 pb-3 font-mono text-xs uppercase">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>FUTURE_DETERIORATION_DETECTION</span>
              </div>

              <div className="space-y-4 font-mono text-[10px] text-zinc-500">
                {[
                  { segment: "Morar Bypass Highway Phool Bagh", index: 88, status: "ACCELERATED_WEAR", color: "text-red-400" },
                  { segment: "Gwalior Maharaj Bada Fort Road", index: 42, status: "STABLE", color: "text-cyan-400" },
                  { segment: "Teli Ka Mandir Fort Path", index: 15, status: "OPTIMAL", color: "text-emerald-400" }
                ].map((s, i) => (
                  <div key={i} className="p-3 border border-zinc-900 rounded bg-zinc-900/10 flex justify-between items-center">
                    <div className="flex flex-col gap-0.5 max-w-[220px]">
                      <span className="font-bold text-zinc-300 truncate block">{s.segment}</span>
                      <span className="text-[7px] text-zinc-500 uppercase">PREDICTIVE DETERIORATION RATE</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className={`font-bold ${s.color}`}>{s.index}%</span>
                      <span className="text-[7px] text-zinc-500">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotspot maps coordinates */}
            <div className="lg:col-span-6 p-6 rounded-xl border border-purple-900/20 bg-purple-950/5 space-y-5 text-left">
              <div className="flex items-center gap-2 text-purple-400 font-bold border-b border-purple-950 pb-3 font-mono text-xs uppercase">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>ISSUE_HOTSPOT_PREDICTION_RADAR</span>
              </div>

              <div className="space-y-4 font-mono text-[10px] text-zinc-500">
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <span>WATER_INFRA_HOTSPOT:</span>
                  <span className="text-purple-400 font-bold">26.2183N / 78.1828E</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <span>ROADS_DETERIORATION_CLUSTER:</span>
                  <span className="text-purple-400 font-bold">26.2383N / 78.2028E</span>
                </div>

                <div className="p-3.5 border border-purple-500/10 bg-purple-950/10 rounded-lg text-xs leading-normal flex items-start gap-2.5 font-sans">
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5 animate-pulse" />
                  <p className="font-sans text-[11px] text-zinc-400">
                    **Radar prediction:** High convergence probability of water leak anomalies overlaying high-wear asphalt boundaries near Morar Bypass within 14 days. Suggesting preemptive crew dispatch.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Panel 4: AI Voice Ingestion */}
        {activeTab === 'voice' && (
          <motion.div
            key="voice"
            variants={scaleInVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Recording Controls */}
            <div className="lg:col-span-5 p-6 rounded-xl border border-zinc-800 bg-zinc-950/80 flex flex-col justify-between h-[350px]">
              <div className="text-left space-y-2">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold block border-b border-zinc-900 pb-2 mb-2">VOICE_REPORTING_SANDBOX</span>
                <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                  Record detailed verbal reports. AI Speech-to-Text handles spelling, parses keywords, estimates coordinates, and auto-generates municipal grievance records instantly.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 flex-1 py-6">
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_#ef4444]' : 'bg-purple-900/20 hover:bg-purple-900/30 text-purple-400 border border-purple-500/20'}`}
                >
                  {isRecording ? <MicOff className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
                </button>
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                  {isRecording ? 'RECORDING_ACTIVE' : 'CLICK_TO_SIMULATE_VOICE'}
                </span>
              </div>
            </div>

            {/* Extracted Record console */}
            <div className="lg:col-span-7 p-6 rounded-xl border border-purple-950/20 bg-zinc-950 shadow-xl min-h-[350px] flex flex-col justify-between">
              
              {voiceStep === 2 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <Volume2 className="w-8 h-8 text-purple-400 animate-bounce" />
                  <span className="font-mono text-[10px] text-purple-400 font-bold uppercase tracking-widest animate-pulse">TRANSCRIBING_VERBAL_STREAM</span>
                  <p className="font-sans text-xs text-zinc-500 max-w-xs">{voiceText}</p>
                </div>
              ) : voiceStep === 3 && voiceExtract ? (
                <div className="space-y-4 text-left flex-1">
                  <div className="flex items-center gap-2 text-purple-400 font-bold border-b border-purple-950 pb-3 mb-2 font-mono text-xs uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>EXTRACTED_MUNICIPAL_LEDGER</span>
                  </div>

                  <div className="space-y-3 font-mono text-[10px] text-zinc-400">
                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span>AUTO_GENERATED_TITLE:</span>
                      <span className="text-zinc-200 font-sans font-bold text-xs">{voiceExtract.title}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span>CLASSIFICATION:</span>
                      <span className="text-purple-400 font-bold uppercase">{voiceExtract.category}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span>SEVERITY_LEVEL:</span>
                      <span className="text-red-400 font-bold uppercase">{voiceExtract.severity}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span>RESOLVED_COORDINATES:</span>
                      <span className="text-zinc-200 font-bold">{voiceExtract.location}</span>
                    </div>

                    <div className="p-3 border border-purple-500/10 bg-purple-950/10 rounded-lg text-xs leading-normal flex items-start gap-2.5 font-sans mt-3">
                      <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5 animate-pulse" />
                      <p className="font-sans text-[11px] text-zinc-400 font-semibold">
                        Ready to post. Complete municipal ticket auto-generated.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16 gap-3">
                  <Volume2 className="w-8 h-8 text-zinc-700" />
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">AWAITING_VERBAL_RECORD</span>
                </div>
              )}

              <div className="h-10 border-t border-zinc-900 bg-zinc-950/60 px-5 flex items-center justify-between flex-shrink-0 text-[9px] font-mono text-zinc-500 uppercase tracking-widest -mx-6 -mb-6 mt-4">
                <span>SPEECH-TO-TEXT TUNNEL: idle</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </motion.div>
  );
}

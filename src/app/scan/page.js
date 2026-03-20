/* eslint-disable @next/next/no-img-element */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Globe, Search, Loader2, Sparkles, Copy, Check, Link as LinkIcon, FileText, BarChart, Tag, Lightbulb, ExternalLink, ArrowUpRight, ArrowRight, ShieldCheck, Zap, ChevronDown, Activity, CheckCircle2, Target, BrainCircuit, AlertTriangle, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ToastProvider";

const SCAN_STEPS = [
  { icon: Globe,        text: 'Connecting to website…' },
  { icon: FileText,     text: 'Parsing HTML structure…' },
  { icon: Tag,          text: 'Reading meta tags & Open Graph…' },
  { icon: Search,       text: 'Analysing heading hierarchy…' },
  { icon: ShieldCheck,  text: 'Checking HTTPS & security signals…' },
  { icon: BarChart,     text: 'Counting links & images…' },
  { icon: Zap,          text: 'Running robots.txt & sitemap check…' },
  { icon: Lightbulb,    text: 'Extracting keywords from headings…' },
  { icon: Activity,     text: 'Computing SEO score…' },
  { icon: Sparkles,     text: 'Finding similar websites…' },
  { icon: CheckCircle2, text: 'Finalising report…' },
];

// ─────────────────────────────────────────────────────────────────────────────
// INTENT ALIGNMENT CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const INTENT_META = {
  Informational: { icon: '📚', labelCls: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700' },
  Commercial:    { icon: '🛒', labelCls: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700' },
  Transactional: { icon: '💳', labelCls: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700' },
  Navigational:  { icon: '🧭', labelCls: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700' },
};

function IntentBadge({ label }) {
  const meta = INTENT_META[label] || { labelCls: 'bg-gray-100 text-gray-700 border-gray-200', icon: '❓' };
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[11px] font-black tracking-tight shadow-sm transition-all hover:scale-[1.02] ${meta.labelCls}`}>
      <span className="grayscale">{meta.icon}</span>
      {label}
    </span>
  );
}

function AlignmentRing({ score }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <motion.circle
          cx="40" cy="40" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold leading-none" style={{ color }}>{score}</span>
        <span className="text-[9px] font-bold text-gray-400 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function IntentAlignmentCard({ result, isLoading, error, onAnalyze }) {
  const isAligned = result && result.alignmentScore >= 70;
  const isMisaligned = result && result.alignmentScore < 40;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-white dark:bg-[#1e1e28] rounded-[24px] border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
            <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white font-heading">Search Intent Alignment</h3>
            <p className="text-[11px] text-gray-400 font-medium">Is your content what searchers actually want?</p>
          </div>
        </div>
        {!result && !isLoading && (
          <button
            onClick={onAnalyze}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md"
          >
            <Target className="w-3.5 h-3.5" />
            Analyse Intent
          </button>
        )}
        {result && (
          <button
            onClick={onAnalyze}
            className="text-[11px] font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors underline underline-offset-2 decoration-gray-300"
          >
            Re-run
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        {/* Idle — not yet run */}
        {!result && !isLoading && !error && (
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium py-1">
            Detects whether your content matches searcher intent — Informational, Commercial, Transactional, or Navigational.
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
              <BrainCircuit className="w-5 h-5 text-indigo-400 absolute inset-0 m-auto" />
            </div>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Reading ranking psychology…</p>
            <p className="text-xs text-gray-400 font-medium">Comparing your intent signal vs. your actual content mix.</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-4">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-0.5">Intent analysis failed</p>
              <p className="text-xs text-red-500 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col sm:flex-row gap-5 items-start"
          >
            {/* Score Ring */}
            <AlignmentRing score={result.alignmentScore} />

            {/* Details */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              {/* Intent pills row */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="text-gray-400 shrink-0">Target Intent</span>
                <IntentBadge label={result.targetIntent} />
                <span className="text-gray-300 mx-1">→</span>
                <span className="text-gray-400 shrink-0">Actual Content</span>
                <IntentBadge label={result.actualContentFocus} />
              </div>

              {/* Verdict */}
              <div className={`rounded-2xl border px-4 py-3 ${isMisaligned
                ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                : isAligned
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'
              }`}>
                <div className="flex items-start gap-2">
                  {isMisaligned
                    ? <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    : isAligned
                      ? <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      : <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  }
                  <p className={`text-xs font-semibold leading-relaxed ${
                    isMisaligned ? 'text-red-700 dark:text-red-300' : isAligned ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'
                  }`}>
                    {result.verdict}
                  </p>
                </div>
              </div>

              {/* Score explanation micro-bar */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 shrink-0 w-20">Alignment</span>
                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${result.alignmentScore >= 70 ? 'bg-green-500' : result.alignmentScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${result.alignmentScore}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-[10px] font-black text-gray-500 shrink-0">{result.alignmentScore}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO DIFF — BEFORE vs AFTER IMPACT SIMULATOR
// ─────────────────────────────────────────────────────────────────────────────

function CtrBar({ label, current, suggested }) {
  const max = Math.max(suggested * 1.2, 10);
  const pctCurrent = Math.min((current / max) * 100, 100);
  const pctSuggested = Math.min((suggested / max) * 100, 100);
  const delta = (suggested - current).toFixed(1);
  const improved = suggested > current;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
          improved ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-500 border-gray-200'
        }`}>
          {improved ? `+${delta}%` : `${delta}%`}
        </span>
      </div>
      {/* Current */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-gray-400 w-12 shrink-0 font-bold">Before</span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gray-300 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pctCurrent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[9px] font-black text-gray-400 w-8 text-right shrink-0">{current}%</span>
      </div>
      {/* Suggested */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-gray-400 w-12 shrink-0 font-bold">After</span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-black rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pctSuggested}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
          />
        </div>
        <span className="text-[9px] font-black text-black w-8 text-right shrink-0">{suggested}%</span>
      </div>
    </div>
  );
}

function SeoDiffPanel({ result, currentTitle, currentMeta }) {
  if (!result?.currentTitleCTR) return null;
  const totalDelta = (
    (result.suggestedTitleCTR - result.currentTitleCTR) +
    (result.suggestedMetaCTR - result.currentMetaCTR)
  ).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white dark:bg-[#1e1e28] rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Impact Simulator</span>
        </div>
        <div className="flex items-center gap-2">
          {result.scoreDelta > 0 && (
            <span className="text-[10px] font-black bg-black text-white px-2.5 py-1 rounded-full">
              +{result.scoreDelta} pts potential
            </span>
          )}
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-gray-100 dark:border-gray-700" />

      {/* CTR Bars */}
      <div className="flex flex-col gap-4">
        <CtrBar
          label="Title CTR"
          current={result.currentTitleCTR}
          suggested={result.suggestedTitleCTR}
        />
        <CtrBar
          label="Meta CTR"
          current={result.currentMetaCTR}
          suggested={result.suggestedMetaCTR}
        />
      </div>

      {/* Footer summary */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
        <span className="text-[10px] text-gray-400 font-medium">Estimates based on title quality signals &amp; keyword density</span>
        <span className="text-[10px] font-black text-black dark:text-white">
          Total CTR lift: +{totalDelta}%
        </span>
      </div>
    </motion.div>
  );
}

export default function ScanPage() {
  const { success, error: toastError, info } = useToast();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [scanResult, setScanResult] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const stepRef = useRef(null);

  // Animate loading steps while scanning
  useEffect(() => {
    if (status !== 'scanning') { clearInterval(stepRef.current); return; }
    setLoadingStep(0); setProgress(0);
    let step = 0;
    stepRef.current = setInterval(() => {
      step = Math.min(step + 1, SCAN_STEPS.length - 2); // stop one before last — API completes it
      setLoadingStep(step);
      setProgress(Math.round((step / (SCAN_STEPS.length - 1)) * 90)); // cap at 90% until done
    }, 1800);
    return () => clearInterval(stepRef.current);
  }, [status]);

  // SEO Copilot state
  const [isCopiloting, setIsCopiloting] = useState(false);
  const [copilotResult, setCopilotResult] = useState(null);
  const [copilotError, setCopilotError] = useState(null);
  const [copied, setCopied] = useState(null);

  // Preview img state
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  // Intent Alignment Engine state
  const [isAnalyzingIntent, setIsAnalyzingIntent] = useState(false);
  const [intentResult, setIntentResult] = useState(null);
  const [intentError, setIntentError] = useState(null);

  // Steps: 0: Target Link, 1: Analyze, 2: Optimize, 3: Review
  const [currentStep, setCurrentStep] = useState(0);

  const steps = ["Target link", "Analyze", "Optimize", "Review"];

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleScan = async (e) => {
    e?.preventDefault();
    if (!url.trim()) return;

    setStatus("scanning");
    setScanResult(null);
    setCurrentStep(0);

    try {
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Analysis failed. Please check the URL.');
      }

      clearInterval(stepRef.current);
      setLoadingStep(SCAN_STEPS.length - 1);
      setProgress(100);
      await new Promise(r => setTimeout(r, 400));

      setScanResult({
        url: data.url,
        score: data.score,
        iframeBlocked: data.iframeBlocked,
        screenshotUrl: data.screenshotUrl,
        foundKeywords: data.foundKeywords,
        suggestedKeywords: data.suggestedKeywords,
        competitors: data.competitors,
        data: data.data,
        details: data.details,
        contentSnapshot: data.contentSnapshot,
      });
      setPreviewLoaded(false);
      setPreviewFailed(false);
      setIntentResult(null);
      setIntentError(null);
      setStatus("done");
      setCurrentStep(1);
      setCopilotResult(null);
      success('Scan complete', `SEO score: ${data.score}/100`);
    } catch (error) {
      clearInterval(stepRef.current);
      toastError('Scan failed', error.message || 'Failed to analyze URL. Is the URL valid?');
      setStatus("idle");
    }
  };

  const handleCopilot = async () => {
    if (!scanResult) return;
    setIsCopiloting(true);
    setCopilotResult(null);
    setCopilotError(null);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: scanResult.url,
          score: scanResult.score,
          title: scanResult.details?.title?.value || '',
          metaDesc: scanResult.details?.metaDesc?.value || '',
          keywords: (scanResult.foundKeywords?.map(k => k.word) || []).concat(scanResult.suggestedKeywords?.map(k => k.word) || []),
          h1Count: scanResult.details?.h1Count?.value || 0,
          hasViewport: scanResult.details?.mobileCheck?.status || false,
          isSecure: scanResult.details?.isSecure?.status || false,
          imagesWithoutAlt: scanResult.details?.images?.withoutAlt || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Copilot failed');
      setCopilotResult(data);
      success('AI suggestions ready', 'Review your optimized title and meta description.');
    } catch (err) {
      toastError('Copilot failed', err.message);
      setCopilotError(err.message);
    } finally {
      setIsCopiloting(false);
    }
  };

  const handleIntentAnalysis = async () => {
    if (!scanResult) return;
    setIsAnalyzingIntent(true);
    setIntentResult(null);
    setIntentError(null);
    try {
      const res = await fetch('/api/intent-alignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: scanResult.url,
          title: scanResult.details?.title?.value || '',
          keywords: (scanResult.foundKeywords?.map(k => k.word) || []).concat(scanResult.suggestedKeywords?.map(k => k.word) || []),
          contentSnapshot: scanResult.contentSnapshot || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Intent analysis failed');
      setIntentResult(data);
    } catch (err) {
      setIntentError(err.message);
    } finally {
      setIsAnalyzingIntent(false);
    }
  };

  // Arch/Circular Arc properties
  const score = scanResult?.score || 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference / 2;
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7] dark:bg-[#0f0f12] text-gray-900 dark:text-gray-100 border-l border-gray-200 dark:border-gray-800 relative overflow-y-auto w-full p-6 md:p-10">

      {/* Top Stepper Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-center gap-2 md:gap-4 mb-8 overflow-x-auto pb-2">
        {steps.map((step, idx) => {
          const isActive = currentStep === idx || (status === 'scanning' && idx === 0);
          const isDone = currentStep > idx;
          const icon = idx === 0 ? <LinkIcon size={14} /> : idx === 1 ? <Search size={14} /> : idx === 2 ? <Sparkles size={14} /> : <FileText size={14} />;

          let stateClasses = "text-gray-400 bg-white dark:bg-[#1e1e28] border-gray-100 dark:border-gray-700"; // default
          if (isDone) stateClasses = "text-black dark:text-white bg-white dark:bg-[#1e1e28] border-gray-200 dark:border-gray-600 font-semibold shadow-sm";
          else if (isActive) stateClasses = "text-black dark:text-white bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 font-semibold shadow-sm ring-2 ring-gray-200 dark:ring-gray-700 ring-offset-2 dark:ring-offset-gray-900";

          return (
            <div key={idx} className="flex items-center gap-2 md:gap-4 shrink-0 transition-all">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs md:text-sm transition-all duration-300 ${stateClasses}`}>
                {icon}
                {step}
              </div>
              {idx < 3 && (
                <div className="w-8 md:w-16 h-[3px] bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full bg-black dark:bg-white transition-all duration-500 ease-out fill-mode-forwards ${isDone ? 'w-full' : 'w-0'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col pb-10">
        <AnimatePresence mode="wait">
          {/* STEP 0: TARGET LINK */}
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-1 items-center justify-center flex-col max-w-2xl mx-auto w-full py-12 md:py-20"
            >
              {/* ── Loading overlay (shown while scanning) ── */}
              {status === 'scanning' ? (
                <div className="bg-white dark:bg-[#1e1e28] rounded-[32px] p-8 md:p-12 border border-gray-200 dark:border-gray-700 shadow-xl w-full flex flex-col items-center text-center gap-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-white/5 opacity-50 animate-pulse pointer-events-none" />
                  <div className="w-20 h-20 rounded-[24px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center shadow-2xl relative z-10 transition-all duration-500 transform scale-100 hover:scale-110">
                    {(() => { const S = SCAN_STEPS[loadingStep]?.icon || Activity; return <S className="w-10 h-10" />; })()}
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-2xl font-black font-heading mb-2 tracking-tight">Analysing website pipeline…</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{SCAN_STEPS[loadingStep]?.text}</p>
                  </div>
                  <div className="w-full flex flex-col gap-3 relative z-10">
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden shadow-inner">
                      <div className="h-full bg-black dark:bg-white rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500 font-black tracking-widest uppercase">
                      <span className="truncate max-w-[70%]">{url}</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 w-full text-left bg-gray-50/50 dark:bg-black/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 relative z-10">
                    {SCAN_STEPS.slice(Math.max(0, loadingStep - 3), loadingStep + 1).map((step, i) => {
                      const Icon = step.icon;
                      const globalIdx = Math.max(0, loadingStep - 3) + i;
                      const isCurrent = globalIdx === loadingStep;
                      return (
                        <div key={globalIdx} className={`flex items-center gap-3 text-xs font-bold transition-all duration-300 ${isCurrent ? 'text-gray-900 dark:text-white translate-x-1' : 'text-gray-400 opacity-60'}`}>
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${isCurrent ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white text-gray-300 border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}>
                            {isCurrent ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
                          </div>
                          {step.text}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#1e1e28] rounded-[32px] p-8 md:p-12 border border-gray-200 dark:border-gray-700 shadow-xl w-full flex flex-col items-center text-center gap-8">
                  <div className="w-24 h-24 bg-gray-50 dark:bg-zinc-800 rounded-[28px] border border-gray-100 dark:border-zinc-700 flex items-center justify-center shadow-inner group">
                    <Globe className="w-10 h-10 text-black dark:text-white transition-transform duration-500 group-hover:rotate-12" />
                  </div>
                  <div className="max-w-md">
                    <h2 className="text-3xl font-black font-heading mb-3 tracking-tight">Full SEO Pipeline</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">Enter your URL to extract metadata, heading hierarchy, keywords, and AI-powered optimizations.</p>
                  </div>
                  <div className="w-full flex flex-col gap-3">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleScan(e); }}
                      placeholder="https://your-website.com"
                      className="w-full border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-[20px] px-6 py-5 text-center text-lg font-bold focus:outline-none focus:border-black dark:focus:border-white transition-all shadow-sm focus:shadow-md disabled:opacity-50"
                      disabled={status === 'scanning'}
                    />
                    <button
                      onClick={handleScan}
                      disabled={status === 'scanning' || !url.trim()}
                      className="group w-full py-5 bg-black dark:bg-white text-white dark:text-black text-base font-black rounded-[20px] hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
                    >
                      <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
                      Analyse Pipeline
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 1: ANALYZE */}
          {currentStep === 1 && scanResult && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-8 h-full"
            >
              <div className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-[28px] p-5 md:p-6 shadow-sm gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black font-heading leading-tight underline decoration-gray-200 dark:decoration-gray-800 underline-offset-4 decoration-2">Scan Integrity Verified</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">Review core metrics before applying AI</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button onClick={() => setCurrentStep(3)} className="flex-1 md:flex-none px-6 py-3.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 active:scale-95">
                    Skip Optimization
                  </button>
                  <button onClick={() => setCurrentStep(2)} className="flex-1 md:flex-none px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-95 group">
                    <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" /> Force Optimize
                  </button>
                </div>
              </div>

              <IntentAlignmentCard
                result={intentResult}
                isLoading={isAnalyzingIntent}
                error={intentError}
                onAnalyze={handleIntentAnalysis}
              />

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1">


                {/* Left Side (Core Web Data + Competitors) */}
                <div className="flex flex-col gap-6 lg:col-span-4 xl:col-span-3">

                  {/* Core Web Data */}
                  <div className="bg-white dark:bg-[#1e1e28] rounded-[24px] p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-3 h-auto w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart className="w-4 h-4 text-gray-400" />
                      <h3 className="text-sm font-bold text-gray-900 font-heading">Core Web Data</h3>
                    </div>
                    <div className="flex flex-col gap-2">
                      {[
                        {
                          label: 'Load Time',
                          value: scanResult.data.loadTime,
                          desc: 'The speed at which the server completes the initial HTML payload. A faster load time heavily boosts SEO rankings and retains users.'
                        },
                        {
                          label: 'Mobile',
                          value: scanResult.data.mobileReady,
                          desc: 'Checks if a standard meta viewport tag exists. Google highly prioritizes mobile-friendly pages in its search indexing algorithms.'
                        },
                        {
                          label: 'SSL Secure',
                          value: scanResult.data.https || 'N/A',
                          desc: 'Confirms if traffic is encrypted over HTTPS. Websites without an active SSL certificate are actively penalized in search visibility.'
                        },
                        {
                          label: 'H1 Count',
                          value: scanResult.data.h1Check || '0',
                          desc: 'Having exactly one highly-relevant H1 header on the page explicitly signals your direct topic to ranking web crawlers.'
                        },
                        {
                          label: 'Images Alt',
                          value: scanResult.data.imagesAlt || 'N/A',
                          desc: 'Alt tags provide context for visual media. Search engines use this textual data to rank your images inside image search directly.'
                        },
                      ].map(({ label, value, desc }) => (
                        <details key={label} className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden marker:content-[''] [&::-webkit-details-marker]:hidden">
                          <summary className="flex items-center justify-between p-2.5 cursor-pointer outline-none hover:bg-gray-100 transition-colors list-none gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate shrink">{label}</span>
                              <ChevronDown className="w-3 h-3 text-gray-400 shrink-0 group-open:rotate-180 transition-transform duration-200" />
                            </div>
                            <div className={`flex items-center justify-center shrink-0 min-w-max px-2.5 py-1 rounded-full ${/good|secure|verified|optimized|yes/i.test(value)
                              ? 'bg-green-100 text-green-700'
                              : /missing|insecure|no|0 tag|error/i.test(value)
                                ? 'bg-red-100 text-red-600'
                                : /needs|work|slow|warn/i.test(value)
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                              <span className="text-[10px] font-black whitespace-nowrap leading-none">{value}</span>
                            </div>
                          </summary>
                          <div className="px-3 pb-3 text-[10px] text-gray-500 font-medium leading-relaxed border-t border-gray-100 pt-2">
                            {desc}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>

                  {/* Competitor Analysis Box */}
                  <details open className="group bg-white dark:bg-[#1e1e28] rounded-[24px] p-5 border border-gray-200 dark:border-gray-700 shadow-sm h-max w-full outline-none marker:content-[''] [&::-webkit-details-marker]:hidden cursor-pointer transition-colors">
                    <summary className="flex justify-between items-center outline-none list-none mb-3">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Globe className="w-4 h-4" />
                        <h3 className="text-sm font-bold text-gray-900 font-heading">Similar Websites</h3>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform duration-200" />
                    </summary>

                    <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-100">
                      {scanResult.competitors?.length > 0 ? scanResult.competitors.slice(0, 6).map((comp, i) => (
                        <a
                          key={i}
                          href={comp.isUser ? (comp.resolvedUrl || `https://${comp.url}`) : (comp.resolvedUrl || `https://${comp.url}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex justify-between items-center p-3 rounded-xl border transition-colors group ${comp.isUser ? 'bg-black border-black text-white' : 'bg-gray-50 border-gray-100 hover:border-gray-300 hover:bg-gray-100'}`}
                        >
                          <span className={`text-[11px] font-bold truncate mr-2 flex items-center gap-1.5 ${comp.isUser ? 'text-white' : 'text-gray-600 group-hover:text-black'}`}>
                            <span className={`text-[10px] font-black ${comp.isUser ? 'text-gray-300' : 'text-gray-400'}`}>{i + 1}.</span>
                            {comp.url}
                            {comp.isUser && <span className="text-[9px] bg-white text-black px-1.5 py-0.5 rounded-full font-black ml-1">You</span>}
                            {comp.rank && !comp.isUser && <span className="text-[9px] text-gray-400 ml-1">#{comp.rank}</span>}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs font-black ${comp.score <= 50 ? 'text-red-500' : comp.score <= 70 ? 'text-yellow-500' : 'text-green-500'}`}>{comp.score}</span>
                            <ExternalLink size={10} className={comp.isUser ? 'text-gray-400' : 'text-gray-300 group-hover:text-gray-500'} />
                          </div>
                        </a>
                      )) : (
                        <span className="text-xs text-gray-500 p-2 text-center font-medium">No competitors detected in niche</span>
                      )}
                    </div>
                  </details>

                </div>

                {/* Center: Website Preview (always screenshot via microlink) */}
                <div className="bg-white dark:bg-[#1e1e28] rounded-[24px] border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col lg:col-span-5 xl:col-span-6 min-h-[400px] lg:min-h-[600px] overflow-hidden">
                  {/* Bar */}
                  <div className="w-full bg-gray-50 dark:bg-[#16161f] border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-gray-900 dark:text-white font-heading uppercase tracking-wider bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 shadow-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <Globe size={14} className="text-gray-400" /> Website Preview
                    </span>
                    <a href={scanResult.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors">
                      <ExternalLink size={14} /> View Live
                    </a>
                  </div>

                  {/* Screenshot — always use microlink, React state for loading/error */}
                  <div className="relative flex-1 w-full min-h-[400px] bg-gray-50 dark:bg-[#16161f] overflow-hidden">
                    {/* Loading skeleton — shown until image loads or fails */}
                    {!previewLoaded && !previewFailed && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 animate-pulse">
                        <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Globe className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="h-2 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <p className="text-[11px] text-gray-400 font-medium mt-1">Loading preview…</p>
                      </div>
                    )}

                    {/* Actual screenshot */}
                    {!previewFailed && (
                      <img
                        src={scanResult.screenshotUrl}
                        alt={`Preview of ${scanResult.url}`}
                        className={`w-full h-full object-cover object-top transition-opacity duration-500 ${previewLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setPreviewLoaded(true)}
                        onError={() => { setPreviewLoaded(false); setPreviewFailed(true); }}
                      />
                    )}

                    {/* Graceful fallback if screenshot fails */}
                    {previewFailed && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-[#16161f] px-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Globe className="w-7 h-7 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Preview unavailable</p>
                          <p className="text-xs text-gray-400 font-medium">The site may block automated screenshots.</p>
                        </div>
                        <a
                          href={scanResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold bg-black text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
                        >
                          <ExternalLink size={12} /> Visit site directly
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side (Score + Keywords) */}
                <div className="flex flex-col gap-6 lg:col-span-3 xl:col-span-3">

                  {/* Score Box */}
                  <div className="bg-white dark:bg-[#1e1e28] rounded-[24px] p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center h-auto self-start w-full">
                    <div className="w-full flex items-center gap-2 mb-6 text-gray-400">
                      <ArrowUpRight className="w-4 h-4" />
                      <h3 className="text-sm font-bold text-gray-900 font-heading">SEO Score</h3>
                    </div>

                    <div className="relative w-44 flex flex-col items-center justify-center mb-1">
                      <svg className="w-full h-auto drop-shadow-sm" viewBox="0 0 100 55">
                        <path
                          d="M 10 50 A 40 40 0 0 1 90 50"
                          fill="none"
                          className="stroke-gray-100"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                        <motion.path
                          d="M 10 50 A 40 40 0 0 1 90 50"
                          fill="none"
                          className={score <= 50 ? 'stroke-red-500' : score <= 70 ? 'stroke-yellow-500' : 'stroke-green-500'}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={126}
                          strokeDashoffset={126 - (score / 100) * 126}
                          initial={{ strokeDashoffset: 126 }}
                          animate={{ strokeDashoffset: 126 - (score / 100) * 126 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-x-0 bottom-0 top-[20%] flex flex-col items-center justify-end z-10 translate-y-3">
                        <span className={`text-5xl font-extrabold tracking-tight font-heading leading-none ${score <= 50 ? 'text-red-500' : score <= 70 ? 'text-yellow-500' : 'text-green-500'}`}>{score}</span>
                        <span className="text-[10px] text-gray-400 font-bold tracking-wider mt-1">/ 100</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-6 text-center font-medium">
                      Your overall SEO score
                    </p>
                  </div>

                  {/* Keywords Box */}
                  <div className="bg-white dark:bg-[#1e1e28] rounded-[24px] p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-auto w-full">
                    <div className="w-full flex items-center gap-2 mb-4">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <h3 className="text-sm font-bold text-gray-900 font-heading">Keywords</h3>
                    </div>
                    <div className="flex flex-col gap-5">
                      {scanResult.foundKeywords?.length > 0 && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 mb-2 block tracking-wider">Keywords found on the page</span>
                          <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-2 pb-1 content-start">
                            {scanResult.foundKeywords.map((kw, i) => (
                              <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] text-gray-900 font-bold shadow-sm h-max">
                                {kw.word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 mb-2 block tracking-wider">Suggested Keywords</span>
                        <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-2 pb-1 content-start">
                          {scanResult.suggestedKeywords?.map((kw, i) => (
                            <div key={`s-${i}`} className="flex items-center bg-gray-50 border border-gray-200 rounded-lg shadow-sm h-max overflow-hidden group">
                              <span className="px-3 py-1.5 text-[10px] text-gray-900 font-bold border-r border-gray-200" title={kw.reason}>
                                {kw.word}
                              </span>
                              <button onClick={() => copyToClipboard(kw.word, `kw-${i}`)} className="px-2 py-1.5 hover:bg-gray-200 transition-colors bg-white">
                                {copied === `kw-${i}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-gray-400 group-hover:text-black" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: OPTIMIZE */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col flex-1 items-center max-w-4xl mx-auto w-full gap-6"
            >
              <div className="bg-white dark:bg-[#1e1e28] rounded-[32px] p-8 border border-gray-200 dark:border-gray-700 shadow-sm w-full min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-black text-white rounded-xl shadow-md">
                      <Lightbulb size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-heading">AI Optimization</h2>
                      <p className="text-sm text-gray-500">Generate deep structural and meta optimizations natively.</p>
                    </div>
                  </div>
                  {copilotResult && (
                    <button onClick={() => setCurrentStep(3)} className="px-6 py-2.5 bg-gray-100 text-black text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors border border-gray-200 flex items-center gap-2">
                      Review Changes <ArrowRight size={16} />
                    </button>
                  )}
                </div>

                {!copilotResult && !isCopiloting && !copilotError && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <Sparkles className="w-16 h-16 text-gray-300 mb-6" />
                    <h3 className="text-xl font-bold mb-2">Ready to Enhance?</h3>
                    <p className="text-sm text-gray-500 mb-8 max-w-md">Our Gemini 1.5 AI model will read your parsed site metrics and output actionable meta tags and structural wins.</p>
                    <button
                      onClick={handleCopilot}
                      className="px-8 py-4 bg-black text-white text-base font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-xl active:scale-95 flex items-center gap-3"
                    >
                      <Sparkles className="w-5 h-5" /> Start AI Optimization
                    </button>
                    <button onClick={() => setCurrentStep(3)} className="mt-6 text-sm text-gray-400 font-bold hover:text-black transition-colors underline decoration-gray-300 underline-offset-4">
                      Skip optimization for now
                    </button>
                  </div>
                )}

                {isCopiloting && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
                      <Sparkles className="w-6 h-6 text-gray-400 absolute inset-0 m-auto" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Analyzing semantic structure...</h3>
                    <p className="text-xs text-gray-500 font-medium">Formulating perfect title tags and meta descriptions.</p>
                  </div>
                )}

                {copilotError && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
                      <h3 className="font-bold mb-2 cursor-pointer">Optimization Failed</h3>
                      <p className="text-sm max-w-sm">{copilotError}</p>
                    </div>
                    <button onClick={() => setCurrentStep(3)} className="mt-8 px-6 py-3 bg-gray-100 text-black text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors border border-gray-200">
                      Proceed to Review
                    </button>
                  </div>
                )}

                {copilotResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex-1 flex flex-col gap-5"
                  >
                    {/* Top row: Title + Meta cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Suggested Title */}
                      <div className="bg-gray-50 dark:bg-[#16161f] p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Suggested Title</span>
                          <button onClick={() => copyToClipboard(copilotResult.improvedTitle, 'title')} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                            {copied === 'title' ? <Check size={14} className="text-black dark:text-white" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-sm font-bold leading-relaxed text-gray-900 dark:text-white">{copilotResult.improvedTitle}</p>
                      </div>
                      {/* Suggested Meta */}
                      <div className="bg-gray-50 dark:bg-[#16161f] p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Suggested Meta</span>
                          <button onClick={() => copyToClipboard(copilotResult.improvedMeta, 'meta')} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                            {copied === 'meta' ? <Check size={14} className="text-black dark:text-white" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-sm font-bold leading-relaxed text-gray-900 dark:text-white">{copilotResult.improvedMeta}</p>
                      </div>
                    </div>

                    {/* SEO Diff — Impact Simulator */}
                    <SeoDiffPanel
                      result={copilotResult}
                      currentTitle={scanResult?.details?.title?.value}
                      currentMeta={scanResult?.details?.metaDesc?.value}
                    />

                    {/* Quick Wins */}
                    <div className="bg-black dark:bg-[#0d0d10] text-white p-5 rounded-2xl">
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4 flex items-center gap-2">
                        <Zap size={12} className="text-white" /> Quick Wins
                      </h4>
                      <ul className="flex flex-col gap-3">
                        {copilotResult.quickWins?.map((win, i) => (
                          <li key={i} className="flex gap-3 text-xs">
                            <Check size={14} className="text-gray-500 mt-0.5 shrink-0" />
                            <span className="leading-relaxed font-medium text-gray-200">{win}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3: REVIEW */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col flex-1 items-center max-w-3xl mx-auto w-full gap-6"
            >
              <div className="bg-white dark:bg-[#1e1e28] rounded-[32px] p-8 md:p-12 border border-gray-200 dark:border-gray-700 shadow-sm w-full flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center shadow-lg mb-6">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h2 className="text-3xl font-bold font-heading mb-3">Scan Complete!</h2>
                <p className="text-gray-500 text-sm mb-8 max-w-md">Your SEO deep-dive for <span className="font-bold text-black">{scanResult?.url}</span> is mapped and optimized.</p>

                <div className="w-full bg-gray-50 rounded-2xl border border-gray-200 p-6 flex flex-col gap-6 text-left">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <span className="font-bold">Final Score Dashboard</span>
                    <span className="text-2xl font-black font-heading bg-white px-3 py-1 rounded-xl shadow-sm border border-gray-100">{score}<span className="text-xs text-gray-400">/100</span></span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col justify-center shadow-sm">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Status</span>
                      <span className="text-sm font-bold text-green-600 flex items-center gap-1.5"><ShieldCheck size={16} /> Success</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col justify-center shadow-sm">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Keywords</span>
                      <span className="text-sm font-bold">{(scanResult?.foundKeywords?.length || 0) + (scanResult?.suggestedKeywords?.length || 0)} Total Anchors</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col justify-center shadow-sm col-span-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Advice to keep SEO Up-to-date</span>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">Keep your Core Web Data metrics rapid by compressing images, ensuring your content uses semantic H1/H2 layering, naturally dispersing high-density keywords, and continually writing relevant content for your targeted meta descriptions.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4 w-full">
                   <button
                    onClick={() => {
                      setUrl("");
                      setStatus("idle");
                      setCurrentStep(0);
                      setScanResult(null);
                      setCopilotResult(null);
                    }}
                    className="flex-1 py-4 border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1e1e28] text-gray-900 dark:text-white text-base font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
                  >
                    Run New Scan
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      success('Link Copied', 'Report URL has been copied to clipboard.');
                    }}
                    className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black text-base font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <LinkIcon size={18} /> Share Report
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div >
  );
}

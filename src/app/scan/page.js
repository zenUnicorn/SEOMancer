"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Globe, Search, Loader2, Sparkles, Copy, Check, Link as LinkIcon, FileText, BarChart, Tag, Lightbulb, ExternalLink, ArrowUpRight, ArrowRight, ShieldCheck, Zap, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function ScanPage() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle"); // idle, scanning, done, error
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  // SEO Copilot state
  const [isCopiloting, setIsCopiloting] = useState(false);
  const [copilotResult, setCopilotResult] = useState(null);
  const [copilotError, setCopilotError] = useState(null);
  const [copied, setCopied] = useState(null);

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
    setScanError(null);
    setCurrentStep(0);

    try {
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const data = await res.json();
      setScanResult({
        url: data.url,
        score: data.score,
        iframeBlocked: data.iframeBlocked,
        screenshotUrl: data.screenshotUrl,
        foundKeywords: data.foundKeywords,
        suggestedKeywords: data.suggestedKeywords,
        competitors: data.competitors,
        data: data.data,
        details: data.details
      });
      setStatus("done");
      setCurrentStep(1); // Proceed to Analyze Tab

      // Reset copilot
      setCopilotResult(null);
    } catch (error) {
      setScanError("Failed to analyze URL. Is the URL valid?");
      setStatus("error");
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
    } catch (err) {
      setCopilotError(err.message);
    } finally {
      setIsCopiloting(false);
    }
  };

  // Arch/Circular Arc properties
  const score = scanResult?.score || 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference / 2;
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] text-gray-900 border-l border-gray-200 relative overflow-y-auto w-full p-6 md:p-10">

      {/* Top Stepper Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-center gap-2 md:gap-4 mb-8 overflow-x-auto pb-2">
        {steps.map((step, idx) => {
          const isActive = currentStep === idx || (status === 'scanning' && idx === 0);
          const isDone = currentStep > idx;
          const icon = idx === 0 ? <LinkIcon size={14} /> : idx === 1 ? <Search size={14} /> : idx === 2 ? <Sparkles size={14} /> : <FileText size={14} />;

          let stateClasses = "text-gray-400 bg-white border-gray-100"; // default
          if (isDone) stateClasses = "text-black bg-white border-gray-200 font-semibold shadow-sm";
          else if (isActive) stateClasses = "text-black bg-gray-100 border-gray-200 font-semibold shadow-sm ring-2 ring-gray-200 ring-offset-2";

          return (
            <div key={idx} className="flex items-center gap-2 md:gap-4 shrink-0 transition-all">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs md:text-sm transition-all duration-300 ${stateClasses}`}>
                {icon}
                {step}
              </div>
              {idx < 3 && (
                <div className="w-8 md:w-16 h-[3px] bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full bg-black transition-all duration-500 ease-out fill-mode-forwards ${isDone ? 'w-full' : 'w-0'}`} />
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-1 items-center justify-center flex-col max-w-2xl mx-auto w-full"
            >
              <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-200 shadow-sm w-full flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center shadow-inner">
                  <Globe className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-2">Target Link</h2>
                  <p className="text-gray-500 text-sm">Enter the specific URL you wish to analyze.</p>
                </div>

                <div className="w-full mt-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleScan(e); }}
                    placeholder="https://example.com"
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-6 py-4 text-center text-base focus:outline-none focus:border-black transition-colors disabled:opacity-50 font-medium"
                    disabled={status === 'scanning'}
                  />
                  {scanError && <p className="text-red-500 text-xs mt-3 font-semibold">{scanError}</p>}
                </div>

                <button
                  onClick={handleScan}
                  disabled={status === 'scanning' || !url.trim()}
                  className="w-full py-4 mt-2 bg-black text-white text-base font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-[0.98]"
                >
                  {status === 'scanning' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Scanning & Analyzing Data...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Scan
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 1: ANALYZE */}
          {currentStep === 1 && scanResult && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6 h-full"
            >
              {/* Action Bar */}
              <div className="flex flex-col md:flex-row items-center justify-between bg-white border border-gray-200 rounded-2xl p-4 shadow-sm gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-black w-6 h-6" />
                  <div>
                    <h3 className="font-bold font-heading">Analysis Complete</h3>
                    <p className="text-xs text-gray-500">Review your Core Web Data and Score before proceeding.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button onClick={() => setCurrentStep(3)} className="flex-1 md:flex-none px-6 py-2.5 bg-gray-100 text-black text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors border border-gray-200">
                    Skip to Review
                  </button>
                  <button onClick={() => setCurrentStep(2)} className="flex-1 md:flex-none px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Optimize AI
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

                {/* Left Side (Core Web Data + Competitors) */}
                <div className="flex flex-col gap-6 lg:col-span-4 xl:col-span-3">

                  {/* Core Web Data */}
                  <div className="bg-white rounded-[24px] p-5 border border-gray-200 shadow-sm flex flex-col gap-3 h-auto w-full">
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
                  <details open className="group bg-white rounded-[24px] p-5 border border-gray-200 shadow-sm h-max w-full outline-none marker:content-[''] [&::-webkit-details-marker]:hidden cursor-pointer transition-colors">
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

                {/* Center Live Preview */}
                <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm flex flex-col lg:col-span-5 xl:col-span-6 min-h-[400px] lg:min-h-[600px] overflow-hidden">
                  <div className="w-full bg-gray-50 border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 font-heading uppercase tracking-wider bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <Globe size={14} className="text-gray-400" /> {scanResult.iframeBlocked ? 'Screenshot' : 'Live Preview'}
                      </span>
                      {scanResult.iframeBlocked && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                          iframe blocked by site policy
                        </span>
                      )}
                    </div>
                    <a href={scanResult.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1.5 transition-colors">
                      <ExternalLink size={14} /> View Live
                    </a>
                  </div>

                  {scanResult.iframeBlocked ? (
                    // Screenshot fallback via Thum.io (free, no API key)
                    <div className="relative flex-1 w-full min-h-[400px] overflow-hidden bg-gray-50">
                      <img
                        src={scanResult.screenshotUrl}
                        alt={`Screenshot of ${scanResult.url}`}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="absolute inset-0 hidden flex-col items-center justify-center gap-3 bg-gray-50">
                        <Globe className="w-10 h-10 text-gray-300" />
                        <p className="text-sm font-bold text-gray-500">Screenshot unavailable</p>
                        <a href={scanResult.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold underline text-gray-400 hover:text-black">
                          Visit {scanResult.url} directly →
                        </a>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={scanResult.url}
                      title="Website Preview"
                      className="w-full flex-1 bg-white border-none min-h-[400px]"
                      sandbox="allow-same-origin allow-scripts"
                    />
                  )}
                </div>

                {/* Right Side (Score + Keywords) */}
                <div className="flex flex-col gap-6 lg:col-span-3 xl:col-span-3">

                  {/* Score Box */}
                  <div className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm flex flex-col items-center h-auto self-start w-full">
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
                  <div className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm flex flex-col h-auto w-full">
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
              <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm w-full min-h-[400px] flex flex-col">
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
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500">
                    {/* Left side AI */}
                    <div className="flex flex-col gap-4">
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Suggested Title</span>
                          <button onClick={() => copyToClipboard(copilotResult.improvedTitle, 'title')} className="text-gray-400 hover:text-black">
                            {copied === 'title' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                          </button>
                        </div>
                        <p className="text-sm font-bold leading-relaxed">{copilotResult.improvedTitle}</p>
                      </div>
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Suggested Meta Description</span>
                          <button onClick={() => copyToClipboard(copilotResult.improvedMeta, 'meta')} className="text-gray-400 hover:text-black">
                            {copied === 'meta' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                          </button>
                        </div>
                        <p className="text-sm font-bold leading-relaxed">{copilotResult.improvedMeta}</p>
                      </div>
                    </div>

                    {/* Right side AI */}
                    <div className="flex flex-col">
                      <div className="bg-black text-white p-6 rounded-2xl h-full shadow-lg">
                        <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-6 flex items-center gap-2"><Zap size={14} className="text-white" /> Quick Wins</h4>
                        <ul className="flex flex-col gap-4">
                          {copilotResult.quickWins?.map((win, i) => (
                            <li key={i} className="flex gap-3 text-sm">
                              <span className="text-gray-500 mt-0.5"><Check size={16} /></span>
                              <span className="leading-relaxed font-medium text-gray-200">{win}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
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
              <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-200 shadow-sm w-full flex flex-col items-center text-center">
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
                    className="flex-1 py-4 bg-black text-white text-base font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-md active:scale-[0.98]"
                  >
                    Run New Scan
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

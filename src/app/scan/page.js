"use client";

import { motion } from "framer-motion";
import { Globe, Search, Loader2, Sparkles, Copy, Check, Link as LinkIcon, FileText, BarChart, Tag, Lightbulb, ExternalLink, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function ScanPage() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle"); // idle, scanning, done, error
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  // SEO Copilot state
  const [showCopilot, setShowCopilot] = useState(false);
  const [isCopiloting, setIsCopiloting] = useState(false);
  const [copilotResult, setCopilotResult] = useState(null);
  const [copilotError, setCopilotError] = useState(null);
  const [copied, setCopied] = useState(null);

  // Fake steps animation
  const [currentStep, setCurrentStep] = useState(0);

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
    setCurrentStep(1); // Wait for URL passed

    // Simulate steps purely for UI engagement
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => prev < 3 ? prev + 1 : prev);
    }, 1500);

    try {
      // Validate schema quickly for UI
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
        keywords: data.keywords,
        competitors: data.competitors,
        data: data.data,
        details: data.details
      });
      setStatus("done");
      setCurrentStep(4);

      // Reset copilot
      setShowCopilot(false);
      setCopilotResult(null);
    } catch (error) {
      setScanError("Failed to analyze URL. Is the URL valid?");
      setStatus("error");
    } finally {
      clearInterval(stepInterval);
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
          keywords: scanResult.keywords?.map(k => k.word) || [],
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
  // Arc calculation for a semi-circle / arch effect (half of the circle)
  const arcLength = circumference / 2;
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] text-gray-900 border-l border-gray-200 relative overflow-y-auto w-full p-6 md:p-10">

      {/* Top Stepper Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-center gap-2 md:gap-4 mb-8 overflow-x-auto pb-2">
        {["Upload", "Analyze", "Amplify", "Review"].map((step, idx) => {
          const isActive = status === 'scanning' && currentStep >= idx;
          const isDone = status === 'done';
          const icon = idx === 0 ? <LinkIcon size={14} /> : idx === 1 ? <Search size={14} /> : idx === 2 ? <Sparkles size={14} /> : <FileText size={14} />;

          let stateClasses = "text-gray-400 bg-white border-gray-100"; // default
          if (isDone) stateClasses = "text-black bg-white border-gray-200 font-semibold shadow-sm";
          else if (isActive) stateClasses = "text-black bg-gray-100 border-gray-200 font-semibold shadow-sm animate-pulse";

          return (
            <div key={idx} className="flex items-center gap-2 md:gap-4 shrink-0">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs md:text-sm transition-all ${stateClasses}`}>
                {icon}
                {step}
              </div>
              {idx < 3 && <div className="w-8 md:w-16 h-[1px] bg-gray-200"></div>}
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 h-full pb-10">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6 lg:col-span-1 xl:col-span-1">
          {/* Box 1: URL Input Box (Replaces Resume Upload) */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center gap-4 min-h-[260px]">
            <h3 className="text-sm font-bold text-gray-900 self-start mb-2 font-heading">Website Link</h3>
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 mb-2 border-dashed">
              <Globe className="text-gray-500" size={24} />
            </div>
            <div className="w-full">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL to scan..."
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-center focus:outline-none focus:border-gray-400 transition-colors disabled:opacity-50"
                disabled={status === 'scanning'}
              />
            </div>
            <p className="text-[10px] text-gray-400">Include exact protocol e.g. https://</p>
          </div>

          {/* Box 2: Core Web Data (Replaces Job Description) */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm flex flex-col flex-1 h-full min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 font-heading">Core Web Data</h3>
              <span className="text-[10px] text-gray-400">{status === 'done' ? 'Extracted Data' : 'Waiting...'}</span>
            </div>
            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-[16px] p-5 overflow-y-auto">
              {status === 'idle' && (
                <p className="text-xs text-gray-400 text-center mt-12 leading-relaxed">
                  Scan a URL to see the extracted Core Web Data here, including meta tags, status, and targeted load times. Wait for analysis to begin.
                </p>
              )}
              {status === 'scanning' && (
                <div className="flex flex-col items-center justify-center h-full gap-3 mt-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <Loader2 className="w-6 h-6 text-gray-400" />
                  </motion.div>
                  <p className="text-xs font-semibold text-gray-500 tracking-wider">Scraping site metrics...</p>
                </div>
              )}
              {status === 'error' && (
                <p className="text-xs font-bold text-black border border-gray-200 bg-gray-100 p-4 rounded-xl text-center mt-10">{scanError}</p>
              )}
              {status === 'done' && scanResult && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Load Time (DCL)</span>
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-md">{scanResult.data.loadTime}</span>
                  </div>
                  <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Meta Optimization</span>
                    <span className="text-xs font-semibold">{scanResult.data.metaTags}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mobile Layout</span>
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-md">{scanResult.data.mobileReady}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Secure (SSL)</span>
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-md">{scanResult.data.https || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">H1 Header Count</span>
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-md">{scanResult.data.h1Check || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Image Alt Flow</span>
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-md">{scanResult.data.imagesAlt || "N/A"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Analyze/Amplify Button */}
            <button
              onClick={handleScan}
              disabled={status === 'scanning' || !url.trim()}
              className="mt-6 w-full py-3.5 bg-gray-50 text-gray-900 border border-gray-200 text-sm font-bold rounded-xl hover:bg-gray-100 hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === 'scanning' ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <Sparkles className="w-4 h-4 text-gray-500" />}
              Analyze SEO Data
            </button>
          </div>
        </div>

        {/* CENTER COLUMN (Website Preview) */}
        <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm flex flex-col items-center justify-center lg:col-span-2 xl:col-span-3 min-h-[600px] overflow-hidden relative">

          {status !== 'done' ? (
            <div className="text-center flex flex-col items-center px-6">
              <div className="bg-gray-50 text-gray-400 p-5 rounded-2xl border border-gray-100 mb-6 border-dashed">
                <FileText size={32} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 font-heading mb-3">Website Preview</h2>
              <p className="text-sm text-gray-400 max-w-[320px] leading-relaxed">
                {status === 'scanning' ? 'Generating preview while we scan your given URL...' : 'Upload your target website and click "Analyze SEO Data" to see your live preview render here.'}
              </p>
              {status === 'scanning' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                  className="mt-8"
                >
                  <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-black rounded-full animate-bounce"></div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col">
              <div className="w-full bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 font-heading uppercase tracking-wider bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Globe size={14} className="text-gray-400" /> Live Preview
                </span>
                <a href={scanResult.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1.5 transition-colors">
                  <ExternalLink size={14} /> View Live source
                </a>
              </div>
              {/* Embedded preview frame */}
              <iframe
                src={scanResult.url}
                title="Website Preview"
                className="w-full flex-1 bg-white border-none"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6 lg:col-span-1 xl:col-span-1">

          {/* Box 1: ATS/SEO Score */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm flex flex-col items-center min-h-[220px]">
            <div className="w-full flex items-center gap-2 mb-8">
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-bold text-gray-900 font-heading">SEO Score</h3>
            </div>

            <div className="relative w-32 h-20 flex items-center justify-center overflow-hidden">
              {/* Arched Background (Semi-circle) */}
              <svg className="absolute top-0 w-32 h-32" viewBox="0 0 100 100">
                <path
                  d="M 10 90 A 40 40 0 0 1 90 90"
                  fill="none"
                  className="stroke-gray-100"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {status === 'done' && (
                  <motion.path
                    d="M 10 90 A 40 40 0 0 1 90 90"
                    fill="none"
                    className="stroke-black"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={126} /* Approximate arc length of the semicircle */
                    strokeDashoffset={126 - (score / 100) * 126}
                    initial={{ strokeDashoffset: 126 }}
                    animate={{ strokeDashoffset: 126 - (score / 100) * 126 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                )}
              </svg>
              <div className="absolute top-10 flex flex-col items-center">
                <span className="text-3xl font-extrabold tracking-tight font-heading">{status === 'done' ? score : '--'}</span>
                <span className="text-[10px] text-gray-400 font-bold tracking-wider">/ 100</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-6 text-center font-medium">
              {status === 'done' ? 'Your overall technical score' : 'Analyze to see score'}
            </p>
          </div>

          {/* Box 2: Suggested Keywords */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm flex flex-col min-h-[250px]">
            <div className="w-full flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-bold text-gray-900 font-heading">Keywords</h3>
            </div>
            <div className="flex-1 flex flex-col">
              {status !== 'done' ? (
                <div className="flex flex-col items-center justify-center flex-1 opacity-70">
                  <div className="bg-gray-50 p-4 rounded-full border border-gray-100 mb-4">
                    <Tag className="text-gray-300" size={16} />
                  </div>
                  <p className="text-[11px] font-medium text-gray-400 text-center px-4">Keyword analysis will appear here</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 h-full overflow-y-auto content-start pt-2">
                  {scanResult.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] text-gray-900 font-bold shadow-sm" title={kw.reason}>
                      {kw.word}
                    </span>
                  ))}
                  {scanResult.keywords.length === 0 && <span className="text-xs text-gray-400">No keywords found.</span>}
                </div>
              )}
            </div>
          </div>

          {/* Box 3: Optimize with AI (Interview Prep style) */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm flex flex-col flex-1 min-h-[260px]">
            <div className="w-full flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-bold text-gray-900 font-heading">Optimize AI</h3>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto -mx-2 px-2 custom-scrollbar relative">
              {status !== 'done' ? (
                <div className="flex flex-col items-center justify-center flex-1 opacity-70">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-4 border-dashed">
                    <Lightbulb className="text-gray-300" size={20} />
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium text-center px-4">Analyze your website first to unlock AI insights.</p>
                </div>
              ) : (
                showCopilot ? (
                  <div className="flex flex-col gap-3 text-xs text-gray-900">
                    {isCopiloting && (
                      <div className="flex flex-col items-center justify-center py-6 gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
                          <Sparkles className="absolute inset-0 m-auto text-gray-400 w-3 h-3" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Drafting Meta...</span>
                      </div>
                    )}
                    {copilotError && <p className="text-black bg-gray-100 border border-gray-200 rounded-lg p-3 font-semibold text-center">{copilotError}</p>}
                    {copilotResult && (
                      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-2xl">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-[10px] uppercase text-gray-400 tracking-wider">Suggested Title</span>
                            <button onClick={() => copyToClipboard(copilotResult.improvedTitle, 'title')} className="hover:text-black text-gray-400 transition-colors">
                              {copied === 'title' ? <Check size={14} className="text-black" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <p className="font-bold text-sm leading-relaxed text-gray-900">{copilotResult.improvedTitle}</p>
                        </div>
                        <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-2xl">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-[10px] uppercase text-gray-400 tracking-wider">Quick Wins</span>
                          </div>
                          <ul className="flex flex-col gap-2">
                            {copilotResult.quickWins?.slice(0, 3).map((win, i) => (
                              <li key={i} className="flex gap-2 items-start bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <span className="text-black font-bold text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm">{i + 1}</span>
                                <span className="text-[11px] font-medium text-gray-600 leading-tight">{win}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1">
                    <div className="bg-gray-900 text-white p-3 rounded-2xl shadow-md mb-4 mt-2">
                      <Sparkles size={24} />
                    </div>
                    <p className="text-[11px] font-medium text-gray-500 text-center px-4 mb-5">Identify meta improvements and deep AI structural adjustments.</p>
                    <button
                      onClick={() => { setShowCopilot(true); handleCopilot(); }}
                      className="w-full py-2.5 bg-black text-white text-[11px] uppercase tracking-wider font-bold rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95"
                    >
                      Optimize Meta
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

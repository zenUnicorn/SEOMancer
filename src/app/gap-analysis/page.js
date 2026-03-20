'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ToastProvider';
import {
    GitCompareArrows, Globe, ChevronRight, FileText, Trophy,
    CheckCircle2, XCircle, AlertTriangle, ExternalLink, ArrowRight,
    ShieldCheck, Smartphone, Link2, Image, Search, Tag, Code2, FileSearch,
    Zap, TrendingUp, Activity
} from 'lucide-react';
import {
    FileExportIcon,
    ArrowDown01Icon,
    FileAttachmentIcon,
    Pdf01Icon,
    Doc01Icon,
} from 'hugeicons-react';

const LOADING_STEPS = [
    { icon: Globe, text: 'Fetching both websites…' },
    { icon: FileSearch, text: 'Parsing HTML structure…' },
    { icon: Tag, text: 'Extracting meta tags & Open Graph data…' },
    { icon: Search, text: 'Analysing H1/H2 heading hierarchy…' },
    { icon: Image, text: 'Checking image alt text coverage…' },
    { icon: ShieldCheck, text: 'Verifying HTTPS & security signals…' },
    { icon: Smartphone, text: 'Checking mobile viewport…' },
    { icon: Link2, text: 'Counting internal & external links…' },
    { icon: Code2, text: 'Detecting schema markup…' },
    { icon: Activity, text: 'Computing SEO scores…' },
    { icon: Zap, text: 'Running AI gap analysis…' },
    { icon: TrendingUp, text: 'Finalising report…' },
];

function ScoreBadge({ score, size = 'lg' }) {
    const color = score >= 75 ? 'text-gray-900 dark:text-white' : score >= 50 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400';
    const ring = score >= 75 ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-900' : score >= 50 ? 'border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-900' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900';
    const dim = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-14 h-14 text-lg';
    return (
        <div className={`rounded-2xl border-4 ${ring} ${dim} flex flex-col items-center justify-center font-black ${color} shrink-0 shadow-sm transition-transform hover:scale-105`}>
            {score}
            <span className="text-[9px] font-bold mt-0.5 opacity-60 tracking-wider">/ 100</span>
        </div>
    );
}

function MetricRow({ label, a, b, aWins, icon: Icon }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors px-2 rounded-xl">
            <div className={`text-xs font-bold sm:text-right truncate flex flex-col sm:flex-row items-center justify-end gap-2 ${aWins === true ? 'text-gray-900 dark:text-white' : aWins === null ? 'text-gray-400' : 'text-gray-400 opacity-50'}`}>
                <span className="truncate">{a}</span>
                {aWins === true && <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />}
            </div>
            
            <div className="flex flex-col items-center gap-1 shrink-0 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap text-center">{label}</span>
            </div>
            
            <div className={`text-xs font-bold sm:text-left truncate flex flex-col sm:flex-row-reverse items-center justify-end sm:justify-start gap-2 ${aWins === false ? 'text-gray-900 dark:text-white' : aWins === null ? 'text-gray-400' : 'text-gray-400 opacity-50'}`}>
                <span className="truncate">{b}</span>
                {aWins === false && <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />}
            </div>
        </div>
    );
}

function StatusIndicator({ value, trueText = 'Yes', falseText = 'No' }) {
    return value
        ? <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle2 className="w-3 h-3" />{trueText}</span>
        : <span className="flex items-center gap-1 text-red-500 font-bold text-xs"><XCircle className="w-3 h-3" />{falseText}</span>;
}

export default function GapAnalysis() {
    const { success, error: toastError, warning } = useToast();
    const [tab, setTab] = useState('input');
    const [urlA, setUrlA] = useState('');
    const [urlB, setUrlB] = useState('');
    const [result, setResult] = useState(null);
    const [loadingStep, setLoadingStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const stepRef = useRef(null);

    // Animate loading steps
    useEffect(() => {
        if (tab !== 'loading') return;
        let step = 0;
        const totalSteps = LOADING_STEPS.length;
        stepRef.current = setInterval(() => {
            step = Math.min(step + 1, totalSteps - 1);
            setLoadingStep(step);
            setProgress(Math.round((step / (totalSteps - 1)) * 100));
        }, 1400);
        return () => clearInterval(stepRef.current);
    }, [tab]);

    const runAnalysis = async () => {
        if (!urlA.trim() || !urlB.trim()) {
            warning('Missing URLs', 'Please enter both website URLs before running the analysis.');
            return;
        }
        setLoadingStep(0);
        setProgress(0);
        setTab('loading');

        try {
            const res = await fetch('/api/gap-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urlA, urlB }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            clearInterval(stepRef.current);
            setProgress(100);
            setLoadingStep(LOADING_STEPS.length - 1);
            await new Promise(r => setTimeout(r, 600));
            setResult(data);
            setTab('results');
            success('Analysis complete', `${data.siteA?.hostname} vs ${data.siteB?.hostname} — results ready.`);
        } catch (err) {
            clearInterval(stepRef.current);
            toastError('Analysis failed', err.message || 'Could not complete the comparison. Please try again.');
            setTab('input');
        }
    };

    const buildReportLines = () => {
        if (!result) return [];
        const { siteA, siteB, aiSummary } = result;
        return [
            `SEOMancer Gap Analysis Report`,
            `Generated: ${new Date().toLocaleString()}`,
            ``,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `SITE A: ${siteA.hostname}   Score: ${siteA.score}/100`,
            `SITE B: ${siteB.hostname}   Score: ${siteB.score}/100`,
            ``,
            aiSummary ? `EXECUTIVE SUMMARY:\n${aiSummary.overallSummary}` : '',
            ``,
            `WHY ${aiSummary?.winnerHostname || 'the winner'} RANKS HIGHER:`,
            ...(aiSummary?.whyWinnerRanksHigher?.map((r, i) => `  ${i + 1}. ${r}`) || []),
            ``,
            `TOP OPPORTUNITIES FOR ${aiSummary?.loserHostname || 'the loser'}:`,
            ...(aiSummary?.topOpportunitiesForLoser?.map((o, i) => `  ${i + 1}. ${o}`) || []),
            ``,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `METRIC COMPARISON`,
            ``,
            `Title Tag:  A: ${siteA.title}`,
            `            B: ${siteB.title}`,
            `Meta Desc:  A (${siteA.metaDesc?.length || 0} chars): ${siteA.metaDesc}`,
            `            B (${siteB.metaDesc?.length || 0} chars): ${siteB.metaDesc}`,
            `H1 Count:         A: ${siteA.h1Count}    B: ${siteB.h1Count}`,
            `H2 Count:         A: ${siteA.h2Count}    B: ${siteB.h2Count}`,
            `Word Count:       A: ${siteA.wordCount}  B: ${siteB.wordCount}`,
            `Internal Links:   A: ${siteA.internalLinks}  B: ${siteB.internalLinks}`,
            `External Links:   A: ${siteA.externalLinks}  B: ${siteB.externalLinks}`,
            `Images (no alt):  A: ${siteA.imagesWithoutAlt}/${siteA.totalImages}  B: ${siteB.imagesWithoutAlt}/${siteB.totalImages}`,
            `Load Time:        A: ${(siteA.fetchTime / 1000).toFixed(2)}s  B: ${(siteB.fetchTime / 1000).toFixed(2)}s`,
            `HTTPS:            A: ${siteA.isSecure}  B: ${siteB.isSecure}`,
            `Schema Markup:    A: ${siteA.hasSchema}  B: ${siteB.hasSchema}`,
            `Open Graph:       A: ${!!siteA.ogTitle}  B: ${!!siteB.ogTitle}`,
            `Twitter Card:     A: ${!!siteA.twitterCard}  B: ${!!siteB.twitterCard}`,
            `Canonical Tag:    A: ${siteA.hasCanonical}  B: ${siteB.hasCanonical}`,
            `robots.txt:       A: ${siteA.hasRobotsTxt}  B: ${siteB.hasRobotsTxt}`,
            ``,
            `ISSUES — ${siteA.hostname}:`,
            ...(siteA.issues.map((v, i) => `  ${i + 1}. ${v}`)),
            ``,
            `ISSUES — ${siteB.hostname}:`,
            ...(siteB.issues.map((v, i) => `  ${i + 1}. ${v}`)),
        ];
    };

    const fileName = (ext) => {
        if (!result) return `SEOMancer_gap_analysis.${ext}`;
        const a = result.siteA.hostname.replace(/\./g, '_');
        const b = result.siteB.hostname.replace(/\./g, '_');
        return `SEOMancer_gap_analysis_${a}_${b}.${ext}`;
    };

    const exportTxt = () => {
        const blob = new Blob([buildReportLines().join('\n')], { type: 'text/plain' });
        const el = document.createElement('a');
        el.href = URL.createObjectURL(blob);
        el.download = fileName('txt');
        el.click();
        setShowExportMenu(false);
    };

    const exportPdf = async () => {
        setShowExportMenu(false);
        if (!result) return;
        const { siteA, siteB, aiSummary } = result;

        // Dynamically load jsPDF + AutoTable from CDN (no install needed)
        if (!window._jspdfReady) {
            await new Promise((res, rej) => {
                const s = document.createElement('script');
                s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                s.onload = res; s.onerror = rej; document.head.appendChild(s);
            });
            await new Promise((res, rej) => {
                const s = document.createElement('script');
                s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
                s.onload = res; s.onerror = rej; document.head.appendChild(s);
            });
            window._jspdfReady = true;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();
        let y = 80;

        const chk = (v) => v ? 'Yes' : 'No';
        const trunc = (s, n = 60) => s ? (s.length > n ? s.slice(0, n) + '...' : s) : '—';

        const headStyle = { fillColor: [17, 24, 39], textColor: 255, fontStyle: 'bold', fontSize: 8 };
        const bodyStyle = { fontSize: 8 };
        const tblOpts = (startY, head, body, colStyles = {}) => {
            doc.autoTable({ startY, margin: { left: 40, right: 40 }, head, body, headStyles: headStyle, bodyStyles: bodyStyle, styles: { cellPadding: 5, overflow: 'linebreak' }, columnStyles: colStyles });
            y = doc.lastAutoTable.finalY + 18;
        };

        const section = (title) => {
            if (y > 720) { doc.addPage(); y = 40; }
            doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 24, 39);
            doc.text(title.toUpperCase(), 40, y); y += 4;
            doc.setLineWidth(0.5); doc.setDrawColor(229, 231, 235);
            doc.line(40, y, W - 40, y); y += 12;
        };

        const para = (text, color = [55, 65, 81]) => {
            if (!text) return;
            doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...color);
            const lines = doc.splitTextToSize(String(text), W - 80);
            lines.forEach(l => { if (y > 770) { doc.addPage(); y = 40; } doc.text(l, 40, y); y += 12; });
            y += 4;
        };

        // ── Dark header banner ─────────────────────────────────────────────
        doc.setFillColor(17, 24, 39); doc.rect(0, 0, W, 65, 'F');
        doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
        doc.text('SEOMancer — Gap Analysis Report', 40, 32);
        doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(156, 163, 175);
        doc.text(`Generated: ${new Date().toLocaleString()}   |   ${siteA.hostname} vs ${siteB.hostname}`, 40, 50);

        // ── 1. Score Overview ──────────────────────────────────────────────
        section('SEO Score Overview');
        tblOpts(y,
            [['Site', 'URL', 'SEO Score', 'Status']],
            [
                [siteA.hostname, siteA.url, `${siteA.score}/100`, siteA.score >= siteB.score ? '🏆 Winner' : 'Challenger'],
                [siteB.hostname, siteB.url, `${siteB.score}/100`, siteB.score > siteA.score ? '🏆 Winner' : 'Challenger'],
            ]
        );

        // ── 2. AI Summary ─────────────────────────────────────────────────
        if (aiSummary) {
            section('AI Executive Summary');
            para(aiSummary.overallSummary);

            section(`Why ${aiSummary.winnerHostname} Ranks Higher`);
            aiSummary.whyWinnerRanksHigher?.forEach((r, i) => para(`${i + 1}. ${r}`, [22, 163, 74]));

            section(`Top Fixes for ${aiSummary.loserHostname}`);
            aiSummary.topOpportunitiesForLoser?.forEach((o, i) => para(`${i + 1}. ${o}`, [180, 83, 9]));

            if (aiSummary.keyDifferences?.length) {
                section('AI Key Differences');
                tblOpts(y,
                    [['Metric', siteA.hostname, siteB.hostname, 'Leader']],
                    aiSummary.keyDifferences.map(d => [d.metric, d.siteA, d.siteB, d.winner === 'A' ? siteA.hostname : d.winner === 'B' ? siteB.hostname : 'Tie'])
                );
            }
        }

        // ── 3. Meta Tags ──────────────────────────────────────────────────
        section('Meta Tags');
        tblOpts(y,
            [['Tag', siteA.hostname, siteB.hostname]],
            [
                ['Title Tag', trunc(siteA.title, 70), trunc(siteB.title, 70)],
                ['Title Length', `${siteA.title?.length || 0} chars (ideal 30–60)`, `${siteB.title?.length || 0} chars (ideal 30–60)`],
                ['Meta Description', trunc(siteA.metaDesc, 80), trunc(siteB.metaDesc, 80)],
                ['Meta Desc Length', `${siteA.metaDesc?.length || 0} chars (ideal 100–160)`, `${siteB.metaDesc?.length || 0} chars (ideal 100–160)`],
                ['Meta Keywords #', siteA.metaKeywords?.length || 0, siteB.metaKeywords?.length || 0],
            ],
            { 0: { cellWidth: 100 } }
        );

        // ── 4. Headings ───────────────────────────────────────────────────
        section('Heading Structure');
        tblOpts(y,
            [['Heading', siteA.hostname, siteB.hostname]],
            [
                ['H1 Count (ideal: 1)', siteA.h1Count, siteB.h1Count],
                ['H2 Count', siteA.h2Count, siteB.h2Count],
                ['H3 Count', siteA.h3Count, siteB.h3Count],
                ['H1 Text #1', trunc(siteA.h1s?.[0] || '—', 60), trunc(siteB.h1s?.[0] || '—', 60)],
                ['H1 Text #2', trunc(siteA.h1s?.[1] || '—', 60), trunc(siteB.h1s?.[1] || '—', 60)],
                ['H2 Sample #1', trunc(siteA.h2s?.[0] || '—', 60), trunc(siteB.h2s?.[0] || '—', 60)],
                ['H2 Sample #2', trunc(siteA.h2s?.[1] || '—', 60), trunc(siteB.h2s?.[1] || '—', 60)],
            ],
            { 0: { cellWidth: 100 } }
        );

        // ── 5. Technical Signals ──────────────────────────────────────────
        section('Technical Signals');
        tblOpts(y,
            [['Signal', siteA.hostname, siteB.hostname]],
            [
                ['HTTPS / SSL', chk(siteA.isSecure), chk(siteB.isSecure)],
                ['Mobile Viewport', chk(siteA.hasViewport), chk(siteB.hasViewport)],
                ['Canonical Tag', chk(siteA.hasCanonical), chk(siteB.hasCanonical)],
                ['Schema / JSON-LD', chk(siteA.hasSchema), chk(siteB.hasSchema)],
                ['Open Graph Tags', chk(!!siteA.ogTitle), chk(!!siteB.ogTitle)],
                ['Twitter Card', chk(!!siteA.twitterCard), chk(!!siteB.twitterCard)],
                ['robots.txt', chk(siteA.hasRobotsTxt), chk(siteB.hasRobotsTxt)],
                ['Sitemap Reference', chk(siteA.hasSitemapRef), chk(siteB.hasSitemapRef)],
                ['Favicon', chk(siteA.hasFavicon), chk(siteB.hasFavicon)],
            ],
            { 0: { cellWidth: 120 } }
        );

        // ── 6. Content Metrics ────────────────────────────────────────────
        section('Content Metrics');
        tblOpts(y,
            [['Metric', siteA.hostname, siteB.hostname, 'Leader']],
            [
                ['Word Count', siteA.wordCount.toLocaleString(), siteB.wordCount.toLocaleString(), siteA.wordCount >= siteB.wordCount ? siteA.hostname : siteB.hostname],
                ['Internal Links', siteA.internalLinks, siteB.internalLinks, siteA.internalLinks >= siteB.internalLinks ? siteA.hostname : siteB.hostname],
                ['External Links', siteA.externalLinks, siteB.externalLinks, '—'],
                ['Total Images', siteA.totalImages, siteB.totalImages, '—'],
                ['Images w/o Alt', `${siteA.imagesWithoutAlt}/${siteA.totalImages}`, `${siteB.imagesWithoutAlt}/${siteB.totalImages}`, siteA.imagesWithoutAlt <= siteB.imagesWithoutAlt ? siteA.hostname : siteB.hostname],
                ['Load Time', `${(siteA.fetchTime / 1000).toFixed(2)}s`, `${(siteB.fetchTime / 1000).toFixed(2)}s`, siteA.fetchTime <= siteB.fetchTime ? siteA.hostname : siteB.hostname],
            ],
            { 0: { cellWidth: 110 } }
        );

        // ── 7. OG & Social Tags ───────────────────────────────────────────
        section('Open Graph & Social Tags');
        tblOpts(y,
            [['Tag', siteA.hostname, siteB.hostname]],
            [
                ['OG Title', trunc(siteA.ogTitle || 'Missing', 55), trunc(siteB.ogTitle || 'Missing', 55)],
                ['OG Description', trunc(siteA.ogDesc || 'Missing', 55), trunc(siteB.ogDesc || 'Missing', 55)],
                ['OG Image', siteA.ogImage ? 'Present' : 'Missing', siteB.ogImage ? 'Present' : 'Missing'],
                ['Twitter Card Type', siteA.twitterCard || 'Missing', siteB.twitterCard || 'Missing'],
                ['Twitter Title', trunc(siteA.twitterTitle || 'Missing', 55), trunc(siteB.twitterTitle || 'Missing', 55)],
                ['Twitter Image', siteA.twitterImage ? 'Present' : 'Missing', siteB.twitterImage ? 'Present' : 'Missing'],
            ],
            { 0: { cellWidth: 90 } }
        );

        // ── 8. Issues ─────────────────────────────────────────────────────
        section(`Issues — ${siteA.hostname} (${siteA.issues.length} found)`);
        if (siteA.issues.length === 0) para('No major issues found.', [22, 163, 74]);
        else siteA.issues.forEach((issue, i) => para(`${i + 1}. ${issue}`, [180, 30, 30]));

        section(`Issues — ${siteB.hostname} (${siteB.issues.length} found)`);
        if (siteB.issues.length === 0) para('No major issues found.', [22, 163, 74]);
        else siteB.issues.forEach((issue, i) => para(`${i + 1}. ${issue}`, [180, 30, 30]));

        // ── 9. Strengths ──────────────────────────────────────────────────
        section(`Strengths — ${siteA.hostname}`);
        if (siteA.strengths.length === 0) para('—');
        else siteA.strengths.forEach((s, i) => para(`${i + 1}. ${s}`, [22, 100, 60]));

        section(`Strengths — ${siteB.hostname}`);
        if (siteB.strengths.length === 0) para('—');
        else siteB.strengths.forEach((s, i) => para(`${i + 1}. ${s}`, [22, 100, 60]));

        // ── 10. Summary ───────────────────────────────────────────────────
        section('Overall Summary');
        const winnerS = siteA.score >= siteB.score ? siteA : siteB;
        const loserS = siteA.score < siteB.score ? siteA : siteB;
        tblOpts(y,
            [['Summary Stat', 'Value']],
            [
                ['Winner', `${winnerS.hostname} (${winnerS.score}/100)`],
                ['Runner-up', `${loserS.hostname} (${loserS.score}/100)`],
                ['Score Gap', `${Math.abs(siteA.score - siteB.score)} points`],
                [`Issues — ${siteA.hostname}`, siteA.issues.length],
                [`Issues — ${siteB.hostname}`, siteB.issues.length],
                ['Shared Strengths', siteA.strengths.filter(s => siteB.strengths.includes(s)).length],
            ]
        );

        // ── Footer on every page ──────────────────────────────────────────
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(7); doc.setTextColor(156, 163, 175);
            doc.text(`SEOMancer Gap Analysis  •  Page ${i} of ${pageCount}`, 40, doc.internal.pageSize.getHeight() - 20);
            doc.text(new Date().toLocaleDateString(), W - 80, doc.internal.pageSize.getHeight() - 20);
        }

        doc.save(fileName('pdf'));
    };

    const exportDocx = () => {
        setShowExportMenu(false);
        const { siteA, siteB, aiSummary } = result;
        const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head><meta charset='utf-8'><title>Gap Analysis</title></head><body>
          <h1>SEOMancer — Gap Analysis Report</h1>
          <p><b>Generated:</b> ${new Date().toLocaleString()}</p>
          <h2>Scores</h2>
          <table border='1' cellpadding='6' style='border-collapse:collapse;width:100%'>
          <tr><th>Site</th><th>SEO Score</th></tr>
          <tr><td>${siteA.hostname}</td><td>${siteA.score}/100</td></tr>
          <tr><td>${siteB.hostname}</td><td>${siteB.score}/100</td></tr></table>
          ${aiSummary ? `<h2>Executive Summary</h2><p>${aiSummary.overallSummary}</p>` : ''}
          <h2>Metric Comparison</h2>
          <table border='1' cellpadding='6' style='border-collapse:collapse;width:100%'>
          <tr><th>Metric</th><th>${siteA.hostname}</th><th>${siteB.hostname}</th></tr>
          <tr><td>Title</td><td>${siteA.title}</td><td>${siteB.title}</td></tr>
          <tr><td>Meta Description</td><td>${siteA.metaDesc}</td><td>${siteB.metaDesc}</td></tr>
          <tr><td>H1 Count</td><td>${siteA.h1Count}</td><td>${siteB.h1Count}</td></tr>
          <tr><td>H2 Count</td><td>${siteA.h2Count}</td><td>${siteB.h2Count}</td></tr>
          <tr><td>Word Count</td><td>${siteA.wordCount}</td><td>${siteB.wordCount}</td></tr>
          <tr><td>Internal Links</td><td>${siteA.internalLinks}</td><td>${siteB.internalLinks}</td></tr>
          <tr><td>Images w/o Alt</td><td>${siteA.imagesWithoutAlt}/${siteA.totalImages}</td><td>${siteB.imagesWithoutAlt}/${siteB.totalImages}</td></tr>
          <tr><td>Load Time</td><td>${(siteA.fetchTime / 1000).toFixed(2)}s</td><td>${(siteB.fetchTime / 1000).toFixed(2)}s</td></tr>
          <tr><td>HTTPS</td><td>${siteA.isSecure}</td><td>${siteB.isSecure}</td></tr>
          <tr><td>Schema</td><td>${siteA.hasSchema}</td><td>${siteB.hasSchema}</td></tr>
          </table></body></html>`;
        const blob = new Blob([html], { type: 'application/msword' });
        const el = document.createElement('a');
        el.href = URL.createObjectURL(blob);
        el.download = fileName('doc');
        el.click();
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 min-h-screen pt-16 md:pt-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-900 dark:bg-white p-2.5 rounded-2xl text-white dark:text-gray-900 shrink-0">
                        <GitCompareArrows size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white font-heading">Gap Analysis</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Compare two websites across 20+ SEO signals</p>
                    </div>
                </div>
                {tab === 'results' && (
                    <div className="sm:ml-auto flex gap-2 flex-wrap">
                        <button
                            onClick={() => { setTab('input'); setResult(null); }}
                            className="px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            New Analysis
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu(v => !v)}
                                className="px-3 py-2 text-xs font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-xl hover:bg-black dark:hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                            >
                                <FileExportIcon size={14} className="shrink-0" />
                                <span className="hidden sm:inline">Export Report</span>
                                <ArrowDown01Icon size={12} className="shrink-0" />
                            </button>
                            {showExportMenu && (
                                <div className="absolute right-0 mt-1 bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden min-w-[160px]">
                                    {[['txt', 'Plain Text (.txt)', exportTxt], ['pdf', 'PDF (.pdf)', exportPdf], ['docx', 'Word (.doc)', exportDocx]].map(([ext, label, fn]) => (
                                        <button key={ext} onClick={fn} className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
                                            {ext === 'txt' && <FileAttachmentIcon size={13} className="text-gray-400 shrink-0" />}
                                            {ext === 'pdf' && <Pdf01Icon size={13} className="text-gray-400 shrink-0" />}
                                            {ext === 'docx' && <Doc01Icon size={13} className="text-gray-400 shrink-0" />}
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Tab pills */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
                {['input', 'results'].map((t, i) => (
                    <button
                        key={t}
                        onClick={() => tab === 'results' && setTab(t)}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${tab === t || (t === 'input' && tab === 'loading') ? 'bg-white shadow text-gray-900' : 'text-gray-400 cursor-default'}`}
                    >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${tab === t || (t === 'input' && tab === 'loading') ? 'bg-gray-900 text-white' : 'bg-gray-300 text-gray-500'}`}>{i + 1}</span>
                        {t === 'input' ? 'Setup' : 'Results'}
                    </button>
                ))}
            </div>

            {/* ── TAB: INPUT ──────────────────────────────────────────── */}
            {(tab === 'input') && (
                <div className="flex flex-col items-center flex-1 justify-center pb-16 w-full max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-[#1e1e28] rounded-[32px] p-6 md:p-12 border border-gray-200 dark:border-gray-700 shadow-xl w-full flex flex-col items-center gap-8 text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-800 flex items-center justify-center shadow-inner">
                            <GitCompareArrows className="w-8 h-8 md:w-10 md:h-10 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white font-heading mb-2">Compare two websites</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">We&apos;ll run a full SEO audit on both and give you a detailed side-by-side breakdown.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end w-full">
                        {/* Site A */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Website A</label>
                            <div className="relative">
                                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="url" value={urlA}
                                    onChange={e => setUrlA(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && runAnalysis()}
                                    placeholder="https://example.com"
                                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-[#16161f] border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 rounded-2xl text-sm font-medium focus:outline-none focus:border-gray-900 dark:focus:border-gray-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* VS badge */}
                        <div className="w-9 h-9 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-black flex items-center justify-center shrink-0 self-center mt-4 md:mt-6 mx-auto">VS</div>

                        {/* Site B */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Website B</label>
                            <div className="relative">
                                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="url" value={urlB}
                                    onChange={e => setUrlB(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && runAnalysis()}
                                    placeholder="https://competitor.com"
                                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-[#16161f] border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 rounded-2xl text-sm font-medium focus:outline-none focus:border-gray-900 dark:focus:border-gray-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-3 w-full">
                        <button
                            onClick={runAnalysis}
                            className="w-full max-w-md py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-base rounded-2xl hover:bg-black dark:hover:bg-gray-200 transition-all shadow-md flex items-center justify-center gap-2 hover:gap-3"
                        >
                            Run Gap Analysis <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            disabled title="Coming soon"
                            className="w-full max-w-md py-3 text-xs font-bold text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 select-none"
                        >
                            Compare 3 or more websites
                            <span className="bg-gray-100 dark:bg-gray-900 text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider text-gray-500 font-black">Coming Soon</span>
                        </button>
                    </div>
                    </div>
                </div>
            )}

            {/* ── TAB: LOADING ────────────────────────────────────────── */}
            {tab === 'loading' && (
                <div className="flex flex-1 items-center justify-center flex-col max-w-2xl mx-auto w-full py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-white dark:bg-[#1e1e28] rounded-[40px] p-8 md:p-14 border border-gray-200 dark:border-gray-700 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] w-full flex flex-col items-center text-center gap-10 relative overflow-hidden">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                        
                        {/* Animated Large Icon */}
                        <div className="w-24 h-24 rounded-[32px] bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-2xl relative z-10 transition-all duration-700 scale-100 animate-pulse">
                            {(() => { const S = LOADING_STEPS[loadingStep]?.icon || Activity; return <S className="w-12 h-12" />; })()}
                        </div>
                        
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black font-heading mb-3 tracking-tight">Computing Gap Matrix…</h2>
                            <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">{LOADING_STEPS[loadingStep]?.text}</p>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full flex flex-col gap-4 relative z-10">
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden shadow-inner p-1">
                                <div
                                    className="h-full bg-black dark:bg-white rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2"
                                    style={{ width: `${progress}%` }}
                                >
                                    {progress > 15 && <span className="text-[8px] font-black text-white dark:text-black">{progress}%</span>}
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-gray-500 font-black tracking-widest uppercase">
                                <span className="truncate max-w-[45%] opacity-60">{urlA}</span>
                                <span className="text-black dark:text-white px-2 py-0.5 rounded-lg border border-gray-200 dark:border-gray-700">VS</span>
                                <span className="truncate max-w-[45%] opacity-60 text-right">{urlB}</span>
                            </div>
                        </div>

                        {/* Activity list (refined) */}
                        <div className="flex flex-col gap-2 w-full text-left bg-gray-50/50 dark:bg-black/20 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 relative z-10">
                            {LOADING_STEPS.slice(Math.max(0, loadingStep - 2), loadingStep + 1).map((step, i) => {
                                const Icon = step.icon;
                                const globalIdx = Math.max(0, loadingStep - 2) + i;
                                const isCurrent = globalIdx === loadingStep;
                                return (
                                    <div key={globalIdx} className={`flex items-center gap-4 text-xs font-bold transition-all duration-500 ${isCurrent ? 'text-gray-900 dark:text-white translate-x-2' : 'text-gray-400 opacity-40'}`}>
                                        <div className={`w-6 h-6 rounded-xl flex items-center justify-center border ${isCurrent ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white text-gray-200 border-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm'}`}>
                                            {isCurrent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className="tracking-tight">{step.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB: RESULTS ────────────────────────────────────────── */}
            {tab === 'results' && result && (() => {
                const { siteA, siteB, aiSummary } = result;
                const aWins = siteA.score >= siteB.score;
                const winner = aWins ? siteA : siteB;
                const loser = aWins ? siteB : siteA;

                return (
                    <div className="flex flex-col gap-5">

                        {/* ── Hero scores ── */}
                        <div className="rounded-[24px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e28] p-5 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6">
                            {/* Site A */}
                            <div className={`flex-1 flex flex-col md:flex-row items-center gap-4 ${aWins ? 'opacity-100' : 'opacity-70'}`}>
                                <ScoreBadge score={siteA.score} />
                                <div className="text-center md:text-left">
                                    {aWins && <span className="text-[10px] font-black text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mb-1 mx-auto md:mx-0"><Trophy className="w-3 h-3" />WINNER</span>}
                                    <a href={siteA.url} target="_blank" rel="noopener noreferrer" className="text-base font-black text-gray-900 hover:underline flex items-center gap-1.5 justify-center md:justify-start">
                                        {siteA.hostname} <ExternalLink className="w-3 h-3 text-gray-400" />
                                    </a>
                                    <p className="text-xs text-gray-500 mt-0.5">{siteA.title}</p>
                                </div>
                            </div>

                            {/* VS */}
                            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 text-[11px] font-black flex items-center justify-center shrink-0">VS</div>

                            {/* Site B */}
                            <div className={`flex-1 flex flex-col md:flex-row-reverse items-center gap-4 ${!aWins ? 'opacity-100' : 'opacity-70'}`}>
                                <ScoreBadge score={siteB.score} />
                                <div className="text-center md:text-right">
                                    {!aWins && <span className="text-[10px] font-black text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mb-1 mx-auto md:ml-auto"><Trophy className="w-3 h-3" />WINNER</span>}
                                    <a href={siteB.url} target="_blank" rel="noopener noreferrer" className="text-base font-black text-gray-900 hover:underline flex items-center gap-1.5 justify-center md:justify-end">
                                        {siteB.hostname} <ExternalLink className="w-3 h-3 text-gray-400" />
                                    </a>
                                    <p className="text-xs text-gray-500 mt-0.5">{siteB.title}</p>
                                </div>
                            </div>
                        </div>

                        {/* ── AI Summary ── */}
                        {aiSummary && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Overall summary */}
                                <div className="md:col-span-3 bg-gray-900 dark:bg-black text-white rounded-[20px] p-5 md:p-6">
                                    <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Executive Summary</p>
                                    <p className="text-sm font-medium leading-relaxed">{aiSummary.overallSummary}</p>
                                </div>
                                {/* Why winner wins */}
                                <div className="bg-gray-50 dark:bg-[#16161f] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5">
                                    <p className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" />Why {winner.hostname} wins</p>
                                    <ul className="flex flex-col gap-2">
                                        {aiSummary.whyWinnerRanksHigher?.map((r, i) => (
                                            <li key={i} className="text-xs text-gray-700 dark:text-gray-300 font-medium flex items-start gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-500" />{r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {/* Opportunities for loser */}
                                <div className="bg-gray-50 dark:bg-[#16161f] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5">
                                    <p className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />Top fixes for {loser.hostname}</p>
                                    <ul className="flex flex-col gap-2">
                                        {aiSummary.topOpportunitiesForLoser?.map((o, i) => (
                                            <li key={i} className="text-xs text-gray-700 dark:text-gray-300 font-medium flex items-start gap-1.5">
                                                <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />{o}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {/* Key differences */}
                                <div className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5">
                                    <p className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-1.5"><GitCompareArrows className="w-3.5 h-3.5" />AI Key Differences</p>
                                    <div className="flex flex-col gap-1.5">
                                        {aiSummary.keyDifferences?.slice(0, 5).map((d, i) => (
                                            <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                                <span className={`text-[10px] font-bold text-right ${d.winner === 'A' ? 'text-gray-900 dark:text-white font-black' : 'text-gray-400'}`}>{d.siteA}</span>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider text-center whitespace-nowrap px-1">{d.metric}</span>
                                                <span className={`text-[10px] font-bold text-left ${d.winner === 'B' ? 'text-gray-900 dark:text-white font-black' : 'text-gray-400'}`}>{d.siteB}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Side-by-side metrics ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Column headers */}
                            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${aWins ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                    <span className="text-sm font-black text-gray-900 dark:text-white truncate">{siteA.hostname}</span>
                                    {aWins && <span className="ml-auto text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Winner</span>}
                                </div>
                                <div className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${!aWins ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                    <span className="text-sm font-black text-gray-900 dark:text-white truncate">{siteB.hostname}</span>
                                    {!aWins && <span className="ml-auto text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Winner</span>}
                                </div>
                            </div>

                            {/* ── Meta tags ── */}
                            <div className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5 flex flex-col gap-1">
                                <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Title Tag</p>
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">{siteA.title || <span className="text-red-400 italic">Missing</span>}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{siteA.title?.length || 0} chars {siteA.title?.length >= 30 && siteA.title?.length <= 60 ? '✅' : '⚠️'} (ideal: 30–60)</p>
                            </div>
                            <div className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5 flex flex-col gap-1">
                                <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Title Tag</p>
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">{siteB.title || <span className="text-red-400 italic">Missing</span>}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{siteB.title?.length || 0} chars {siteB.title?.length >= 30 && siteB.title?.length <= 60 ? '✅' : '⚠️'} (ideal: 30–60)</p>
                            </div>

                            <div className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5 flex flex-col gap-1">
                                <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />Meta Description</p>
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">{siteA.metaDesc || <span className="text-red-400 italic">Missing</span>}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{siteA.metaDesc?.length || 0} chars {siteA.metaDesc?.length >= 100 && siteA.metaDesc?.length <= 160 ? '✅' : '⚠️'} (ideal: 100–160)</p>
                            </div>
                            <div className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5 flex flex-col gap-1">
                                <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />Meta Description</p>
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">{siteB.metaDesc || <span className="text-red-400 italic">Missing</span>}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{siteB.metaDesc?.length || 0} chars {siteB.metaDesc?.length >= 100 && siteB.metaDesc?.length <= 160 ? '✅' : '⚠️'} (ideal: 100–160)</p>
                            </div>

                            {/* ── Headings ── */}
                            <div className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5">
                                <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Heading Structure</p>
                                <div className="flex gap-3 mb-3">
                                    {[{ l: 'H1', v: siteA.h1Count, good: siteA.h1Count === 1 }, { l: 'H2', v: siteA.h2Count, good: siteA.h2Count >= 2 }, { l: 'H3', v: siteA.h3Count, good: true }].map(({ l, v, good }) => (
                                        <div key={l} className={`flex-1 rounded-xl p-2 text-center ${good ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                                            <p className="text-xs font-black text-gray-500 dark:text-gray-400">{l}</p>
                                            <p className={`text-lg font-black ${good ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{v}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">H1 Tags</p>
                                {siteA.h1s.slice(0, 3).map((h, i) => <p key={i} className="text-[11px] text-gray-600 dark:text-gray-400 font-medium border-l-2 border-gray-200 dark:border-gray-700 pl-2 mb-1 line-clamp-1">{h}</p>)}
                            </div>
                            <div className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5">
                                <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Heading Structure</p>
                                <div className="flex gap-3 mb-3">
                                    {[{ l: 'H1', v: siteB.h1Count, good: siteB.h1Count === 1 }, { l: 'H2', v: siteB.h2Count, good: siteB.h2Count >= 2 }, { l: 'H3', v: siteB.h3Count, good: true }].map(({ l, v, good }) => (
                                        <div key={l} className={`flex-1 rounded-xl p-2 text-center ${good ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                                            <p className="text-xs font-black text-gray-500 dark:text-gray-400">{l}</p>
                                            <p className={`text-lg font-black ${good ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{v}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">H1 Tags</p>
                                {siteB.h1s.slice(0, 3).map((h, i) => <p key={i} className="text-[11px] text-gray-600 dark:text-gray-400 font-medium border-l-2 border-gray-200 dark:border-gray-700 pl-2 mb-1 line-clamp-1">{h}</p>)}
                            </div>

                            {/* ── Technical signals ── */}
                            {[{
                                title: siteA.hostname,
                                site: siteA,
                            }, {
                                title: siteB.hostname,
                                site: siteB,
                            }].map(({ title, site }, idx) => (
                                <div key={idx} className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5">
                                    <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" />Technical Signals</p>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                                        {[
                                            ['HTTPS', <StatusIndicator key="https" value={site.isSecure} />],
                                            ['Mobile', <StatusIndicator key="mobile" value={site.hasViewport} />],
                                            ['Canonical', <StatusIndicator key="canonical" value={site.hasCanonical} />],
                                            ['Schema/JSON-LD', <StatusIndicator key="schema" value={site.hasSchema} />],
                                            ['Open Graph', <StatusIndicator key="og" value={!!site.ogTitle} />],
                                            ['Twitter Card', <StatusIndicator key="twitter" value={!!site.twitterCard} />],
                                            ['Robots.txt', <StatusIndicator key="robots" value={site.hasRobotsTxt} />],
                                            ['Sitemap Ref', <StatusIndicator key="sitemap" value={site.hasSitemapRef} />],
                                            ['Favicon', <StatusIndicator key="favicon" value={site.hasFavicon} />],
                                        ].map(([label, node]) => (
                                            <div key={label} className="flex items-center justify-between gap-2 py-1 border-b border-gray-50 dark:border-gray-800">
                                                <span className="text-[10px] font-bold text-gray-400">{label}</span>
                                                {node}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* ── Content metrics ── */}
                            <div className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5 md:col-span-2">
                                <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" />Content Metrics</p>
                                <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 mb-2">
                                    <span className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase">Metric</span>
                                    <span className={`text-[10px] font-black uppercase truncate ${aWins ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{siteA.hostname}</span>
                                    <span className={`text-[10px] font-black uppercase truncate ${!aWins ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{siteB.hostname}</span>
                                </div>
                                {[
                                    { label: 'Word Count', a: siteA.wordCount.toLocaleString(), b: siteB.wordCount.toLocaleString(), aW: siteA.wordCount > siteB.wordCount },
                                    { label: 'Internal Links', a: siteA.internalLinks, b: siteB.internalLinks, aW: siteA.internalLinks > siteB.internalLinks },
                                    { label: 'External Links', a: siteA.externalLinks, b: siteB.externalLinks, aW: null },
                                    { label: 'Total Images', a: siteA.totalImages, b: siteB.totalImages, aW: null },
                                    { label: 'Images w/o Alt', a: `${siteA.imagesWithoutAlt}/${siteA.totalImages}`, b: `${siteB.imagesWithoutAlt}/${siteB.totalImages}`, aW: siteA.imagesWithoutAlt < siteB.imagesWithoutAlt },
                                    { label: 'Load Time', a: `${(siteA.fetchTime / 1000).toFixed(2)}s`, b: `${(siteB.fetchTime / 1000).toFixed(2)}s`, aW: siteA.fetchTime < siteB.fetchTime },
                                    { label: 'Meta Keywords', a: siteA.metaKeywords?.length || 0, b: siteB.metaKeywords?.length || 0, aW: siteA.metaKeywords?.length > siteB.metaKeywords?.length },
                                    { label: 'H2 Headings', a: siteA.h2Count, b: siteB.h2Count, aW: siteA.h2Count > siteB.h2Count },
                                    { label: 'H3 Headings', a: siteA.h3Count, b: siteB.h3Count, aW: null },
                                ].map(({ label, a, b, aW }) => (
                                    <div key={label} className="grid grid-cols-[auto_1fr_1fr] gap-x-4 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0 items-center">
                                        <span className="text-[10px] font-bold text-gray-400 w-28">{label}</span>
                                        <span className={`text-xs font-bold ${aW === true ? 'text-gray-900 dark:text-white font-black' : 'text-gray-500 dark:text-gray-400'}`}>{a}</span>
                                        <span className={`text-xs font-bold ${aW === false ? 'text-gray-900 dark:text-white font-black' : 'text-gray-500 dark:text-gray-400'}`}>{b}</span>
                                    </div>
                                ))}
                            </div>

                            {/* ── OG + Twitter tags ── */}
                            <div className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5 md:col-span-2">
                                <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />Open Graph &amp; Social Tags</p>
                                <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 mb-2">
                                    <span className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase w-28">Tag</span>
                                    <span className={`text-[10px] font-black uppercase truncate ${aWins ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{siteA.hostname}</span>
                                    <span className={`text-[10px] font-black uppercase truncate ${!aWins ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{siteB.hostname}</span>
                                </div>
                                {[
                                    { label: 'OG Title', keyA: 'ogTitle' },
                                    { label: 'OG Description', keyA: 'ogDesc' },
                                    { label: 'OG Image', keyA: 'ogImage' },
                                    { label: 'Twitter Card', keyA: 'twitterCard' },
                                    { label: 'Twitter Title', keyA: 'twitterTitle' },
                                    { label: 'Twitter Image', keyA: 'twitterImage' },
                                ].map(({ label, keyA }) => {
                                    const aVal = siteA[keyA];
                                    const bVal = siteB[keyA];
                                    const aHas = !!aVal;
                                    const bHas = !!bVal;
                                    return (
                                        <div key={label} className="grid grid-cols-[auto_1fr_1fr] gap-x-4 py-2 border-b border-gray-50 last:border-0 items-center">
                                            <span className="text-[10px] font-bold text-gray-400 w-28">{label}</span>
                                            <span className={`text-[11px] font-medium truncate ${aHas ? 'text-gray-700' : 'text-red-400 italic'}`}>{aVal ? (aVal.length > 30 ? aVal.slice(0, 30) + '…' : aVal) : 'Missing'}</span>
                                            <span className={`text-[11px] font-medium truncate ${bHas ? 'text-gray-700' : 'text-red-400 italic'}`}>{bVal ? (bVal.length > 30 ? bVal.slice(0, 30) + '…' : bVal) : 'Missing'}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── Issues list ── */}
                            <div className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5">
                                <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" />Issues on {siteA.hostname} <span className="ml-auto text-gray-300 dark:text-gray-700">{siteA.issues.length}</span></p>
                                {siteA.issues.length === 0
                                    ? <p className="text-xs text-gray-500 font-bold">No major issues found 🎉</p>
                                    : siteA.issues.map((issue, i) => (
                                        <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                            <AlertTriangle className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                                            <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">{issue}</span>
                                        </div>
                                    ))}
                            </div>
                            <div className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5">
                                <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" />Issues on {siteB.hostname} <span className="ml-auto text-gray-300 dark:text-gray-700">{siteB.issues.length}</span></p>
                                {siteB.issues.length === 0
                                    ? <p className="text-xs text-gray-500 font-bold">No major issues found 🎉</p>
                                    : siteB.issues.map((issue, i) => (
                                        <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                            <AlertTriangle className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                                            <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">{issue}</span>
                                        </div>
                                    ))}
                            </div>

                            {/* ── Strengths ── */}
                            <div className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5">
                                <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Strengths of {siteA.hostname}</p>
                                {siteA.strengths.map((s, i) => (
                                    <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                        <CheckCircle2 className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                                        <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">{s}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-[20px] p-5">
                                <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Strengths of {siteB.hostname}</p>
                                {siteB.strengths.map((s, i) => (
                                    <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                        <CheckCircle2 className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                                        <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">{s}</span>
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* ── Bottom Summary ── */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[24px] p-8 text-white">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Analysis Summary</p>
                            <h2 className="text-xl font-black mb-4">
                                {(siteA.score >= siteB.score ? siteA : siteB).hostname} leads with a score of {Math.max(siteA.score, siteB.score)}/100
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {[
                                    { label: 'Score Gap', value: `${Math.abs(siteA.score - siteB.score)} pts`, sub: 'difference in SEO score' },
                                    { label: 'Issues Found', value: siteA.issues.length + siteB.issues.length, sub: 'total across both sites' },
                                    { label: 'Shared Strengths', value: siteA.strengths.filter(s => siteB.strengths.includes(s)).length, sub: 'signals both sites pass' },
                                    { label: 'Winner Advantage', value: `+${Math.abs(siteA.score - siteB.score)}`, sub: 'points ahead of competitor' },
                                ].map(({ label, value, sub }) => (
                                    <div key={label} className="bg-white/10 rounded-2xl p-4">
                                        <p className="text-2xl font-black">{value}</p>
                                        <p className="text-xs font-black text-gray-300 mt-0.5">{label}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Critical gaps to close for {(siteA.score < siteB.score ? siteA : siteB).hostname}</p>
                                    <ul className="flex flex-col gap-1.5">
                                        {(siteA.score < siteB.score ? siteA : siteB).issues.slice(0, 4).map((issue, i) => (
                                            <li key={i} className="text-xs text-gray-300 font-medium flex items-start gap-2">
                                                <span className="text-amber-400 shrink-0 mt-0.5">→</span>{issue}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">What {(siteA.score >= siteB.score ? siteA : siteB).hostname} is doing right</p>
                                    <ul className="flex flex-col gap-1.5">
                                        {(siteA.score >= siteB.score ? siteA : siteB).strengths.slice(0, 4).map((s, i) => (
                                            <li key={i} className="text-xs text-gray-300 font-medium flex items-start gap-2">
                                                <span className="text-green-400 shrink-0 mt-0.5">✓</span>{s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* ── Footer CTA ── */}
                        <div className="flex flex-wrap items-center justify-center gap-3 py-6 mt-4 border-t border-gray-100 dark:border-gray-800">
                            <button 
                                onClick={() => { setTab('input'); setResult(null); }} 
                                className="px-6 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98]"
                            >
                                Analyse another pair
                            </button>
                            <div className="relative">
                                <button 
                                    onClick={() => setShowExportMenu(v => !v)} 
                                    className="px-6 py-3 text-sm font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-2xl hover:bg-black dark:hover:bg-gray-200 transition-all flex items-center gap-2 shadow-lg active:scale-[0.98]"
                                >
                                    <FileExportIcon size={16} className="shrink-0" /> Export Report <ArrowDown01Icon size={14} className="shrink-0" />
                                </button>
                                {showExportMenu && (
                                    <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden min-w-[180px] animate-in slide-in-from-bottom-2 duration-200">
                                        {[
                                            ['txt', 'Plain Text (.txt)', exportTxt], 
                                            ['pdf', 'PDF (.pdf)', exportPdf], 
                                            ['docx', 'Word (.doc)', exportDocx]
                                        ].map(([ext, label, fn]) => (
                                            <button 
                                                key={ext} 
                                                onClick={() => { fn(); setShowExportMenu(false); }} 
                                                className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                                            >
                                                {ext === 'txt' && <FileAttachmentIcon size={14} className="text-gray-400 shrink-0" />}
                                                {ext === 'pdf' && <Pdf01Icon size={14} className="text-gray-400 shrink-0" />}
                                                {ext === 'docx' && <Doc01Icon size={14} className="text-gray-400 shrink-0" />}
                                                {label}
                                            </button>
                                        ))}
                                        <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                                            <button 
                                                onClick={() => {
                                                    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                                                    const urlBlob = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = urlBlob;
                                                    a.download = `seomancer-gap-analysis-${result.siteA.hostname}-vs-${result.siteB.hostname}.json`;
                                                    a.click();
                                                    setShowExportMenu(false);
                                                    success('JSON Exported', 'Raw analysis data downloaded.');
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                                            >
                                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                                    <FileText size={14} className="text-gray-500" />
                                                </div>
                                                JSON Data
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    setShowExportMenu(false);
                                                    success('Link Copied', 'Gap analysis URL copied.');
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-xl mt-1"
                                            >
                                                <Link2 size={16} /> Share Comparison
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

        </div>
    );
}



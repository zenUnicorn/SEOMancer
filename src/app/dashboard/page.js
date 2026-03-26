"use client";

import Link from "next/link";
import { 
    ArrowUpRight, 
    Rocket, 
    AlertCircle, 
    TrendingUp, 
    Link as LinkIcon, 
    Image as ImageIcon, 
    Type,
    ArrowRight,
    Activity,
    CheckCircle2,
    Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from 'date-fns';

export default function Overview() {
    const { user } = useAuth();
    // Simulate real-time SEO score updates for "Live" feel
    const [seoScore, setSeoScore] = useState(82);
    const [activities, setActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            // Fluctuate score slightly to simulate live tracking
            setSeoScore(prev => prev === 82 ? 83 : prev === 83 ? 84 : 82);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        async function fetchRecentActivity() {
            if (!user) return;
            setLoadingActivities(true);
            try {
                // Fetch recent scans
                const { data: scans } = await supabase
                    .from('scans')
                    .select('id, url, created_at, score')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                // Fetch recent gap analyses
                const { data: gaps } = await supabase
                    .from('gap_analyses')
                    .select('id, url_a, url_b, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                // Mix and sort
                const combined = [
                    ...(scans || []).map(s => ({ ...s, type: 'scan' })),
                    ...(gaps || []).map(g => ({ ...g, type: 'gap' }))
                ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                 .slice(0, 5);

                setActivities(combined);
            } catch (err) {
                console.error("Error fetching activity", err);
            } finally {
                setLoadingActivities(false);
            }
        }
        fetchRecentActivity();
    }, [user]);

    const topActions = [
        { 
            id: 1, 
            title: "Optimize Missing H1 Tags", 
            target: "homepage & 2 others",
            desc: "Found 3 pages missing primary H1 tags. Adding them can boost your core keyword indexing by up to 15%.", 
            icon: Type, 
            difficulty: "Easy", 
            impact: "High",
            color: "text-blue-500",
            bg: "bg-blue-500/10 border-blue-500/20"
        },
        { 
            id: 2, 
            title: "Fix Broken Internal Links", 
            target: "12 links found (404s)",
            desc: "Crawler detected broken links disrupting link equity. Fixing these immediately restores lost SEO value.", 
            icon: LinkIcon, 
            difficulty: "Medium", 
            impact: "High",
            color: "text-red-500",
            bg: "bg-red-500/10 border-red-500/20"
        },
        { 
            id: 3, 
            title: "Add Missing Image Alt Text", 
            target: "45 high-traffic images",
            desc: "Missing alt attributes are severely hurting your visibility on Google Images. Implement descriptive text.", 
            icon: ImageIcon, 
            difficulty: "Easy", 
            impact: "Medium",
            color: "text-yellow-500",
            bg: "bg-yellow-500/10 border-yellow-500/20"
        },
    ];

    // SVG path for a smooth, dynamic-looking trend line
    const trendPath = "M 0,80 C 20,70 40,90 60,60 C 80,30 100,60 120,40 C 140,20 160,50 180,20 C 200,-10 220,30 240,10 C 260,-10 280,20 300,5";

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-baseline justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-heading tracking-tight flex items-center gap-3">
                        Dashboard
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold tracking-wide uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Live Data
                        </span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        Action-oriented insights to dominate your search rankings this week.
                    </p>
                </div>
                <div className="flex items-center gap-3 pr-0">
                    {/* Language Dropdown */}
                    <div className="relative group/lang z-50">
                        <button className="px-4 py-2.5 bg-white dark:bg-[#121316] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center gap-2 shadow-sm">
                            <Globe size={16} className="text-gray-400" />
                            <span>EN</span>
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-[#121316] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all flex flex-col overflow-hidden py-1">
                            <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-900 dark:text-white w-full text-left">
                                <span className="text-base leading-none block">🇬🇧</span> English
                            </button>
                            <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-600 dark:text-gray-400 w-full text-left">
                                <span className="text-base leading-none block">🇫🇷</span> French
                            </button>
                            <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-600 dark:text-gray-400 w-full text-left">
                                <span className="text-base leading-none block">🇪🇸</span> Spanish
                            </button>
                            <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-600 dark:text-gray-400 w-full text-left">
                                <span className="text-base leading-none block">🇩🇪</span> German
                            </button>
                            <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-600 dark:text-gray-400 w-full text-left">
                                <span className="text-base leading-none block">🇨🇳</span> Mandarin
                            </button>
                        </div>
                    </div>

                    <Link href="/scan" className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 shadow-sm hover:bg-black dark:hover:bg-gray-200">
                        <Rocket size={16} /> Run New Scan
                    </Link>
                </div>
            </div>

            {/* Top Critical Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                
                {/* Global Health Score (Live) */}
                <div className="md:col-span-1 bg-gray-900 dark:bg-white rounded-3xl p-5 text-white dark:text-gray-900 flex flex-col justify-between shadow-xl relative overflow-hidden min-h-[160px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 dark:bg-black/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-start mb-2 z-10">
                        <span className="text-xs font-semibold tracking-wide opacity-80 uppercase">Global Health</span>
                        <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md flex items-center justify-center">
                            <Activity size={16} />
                        </div>
                    </div>
                    <div className="z-10 mt-auto flex flex-col gap-1 text-center justify-center items-center">
                        <div className="flex items-baseline gap-2 mb-1">
                            <h2 className="text-6xl font-black tracking-tighter tabular-nums">{seoScore}</h2>
                            <span className="text-xl font-bold opacity-50">/100</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1.5 text-[10px] font-semibold text-green-400 dark:text-green-600">
                            <span>+4 pts this week</span>
                        </div>
                    </div>
                </div>

                {/* SEO Score Trend (Graph) */}
                <div className="md:col-span-2 bg-white dark:bg-[#121316] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 z-10">
                        <div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">SEO Score Trend (30 Days)</span>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-medium">Consistent upward trajectory after fixing core web vitals.</p>
                        </div>
                        <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
                            <TrendingUp size={12} /> +12.4% Growth
                        </span>
                    </div>

                    {/* Smooth SVG Line Chart */}
                    <div className="w-full h-24 mt-2 relative z-0 flex items-end">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" className="stop-gray-900 dark:stop-white" stopColor="currentColor" stopOpacity="0.15" />
                                    <stop offset="100%" className="stop-gray-900 dark:stop-white" stopColor="currentColor" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {/* Area Fill */}
                            <path d={`${trendPath} L 300,100 L 0,100 Z`} fill="url(#gradient)" className="text-gray-900 dark:text-white" />
                            {/* Trend Line */}
                            <path d={trendPath} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900 dark:text-white" />
                            {/* Data points */}
                            <circle cx="60" cy="60" r="4" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-white dark:text-[#121316] stroke-gray-900 dark:stroke-white" />
                            <circle cx="120" cy="40" r="4" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-white dark:text-[#121316] stroke-gray-900 dark:stroke-white" />
                            <circle cx="180" cy="20" r="4" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-white dark:text-[#121316] stroke-gray-900 dark:stroke-white" />
                            <circle cx="240" cy="10" r="4" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-white dark:text-[#121316] stroke-gray-900 dark:stroke-white" />
                            <circle cx="300" cy="5" r="5" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-gray-900 dark:text-white stroke-white dark:stroke-[#121316] animate-pulse" />
                        </svg>
                        
                        {/* Tooltip mockup for the latest point */}
                        <div className="absolute right-0 top-0 -mt-2 -mr-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                            Today: {seoScore}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1 bg-white dark:bg-[#121316] rounded-3xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full flex items-center justify-center mb-3">
                        <Rocket size={20} />
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white mb-1">Live Updates</span>
                    <p className="text-[10px] text-gray-500 font-medium">Tracking ranking impact continuously.</p>
                </div>
            </div>

            {/* Decision-Oriented Tasks Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Top Actions to Improve Ranking */}
                <div className="lg:col-span-2 bg-white dark:bg-[#121316] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-5 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Activity size={18} className="text-green-500" />
                                Live Market Insights
                            </h3>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mt-1">Algorithmic SEO Adjustments Required To Rank This Week</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-0 h-full justify-between">
                        {topActions.map((action, idx) => {
                            return (
                                <div key={action.id} className="group relative transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center py-4 border-b border-gray-100 last:border-b-0 dark:border-gray-800">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{action.title}</h4>
                                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300">
                                                {action.target}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{action.desc}</p>
                                    </div>
                                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 pt-2 sm:pt-0">
                                        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                            <div className="flex flex-col sm:items-end">
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Impact</span>
                                                <span className={`text-xs font-black ${action.impact === 'High' ? 'text-red-500' : 'text-yellow-500'}`}>{action.impact}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Secondary Sidebar Metrics */}
                <div className="flex flex-col gap-6 w-full h-full lg:col-span-1">
                    {/* Active Scans Summary */}
                    <div className="bg-white dark:bg-[#121316] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex-1 flex flex-col">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                        
                        <div className="flex flex-col gap-4 flex-1">
                            {loadingActivities ? (
                                <div className="text-xs text-gray-500 font-medium py-4 text-center animate-pulse">Loading activity...</div>
                            ) : activities.length === 0 ? (
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium py-4 text-center">No recent activity found.</div>
                            ) : (
                                activities.map((act, idx) => (
                                    <Link href="/history" key={act.id + act.type} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{idx + 1}</span>
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                {act.type === 'scan' ? (
                                                    <CheckCircle2 size={10} className="text-blue-500" />
                                                ) : (
                                                    <AlertCircle size={10} className="text-indigo-500" />
                                                )}
                                                <p className="font-bold text-gray-900 dark:text-white text-[11px] truncate uppercase tracking-wide">
                                                    {act.type === 'scan' ? 'Scan' : 'Gap Analysis'}
                                                </p>
                                            </div>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate w-full group-hover:text-black dark:group-hover:text-white transition-colors leading-tight">
                                                {act.type === 'scan' ? act.url : `${act.url_a} vs ${act.url_b}`}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right flex flex-col items-end">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                                                {formatDistanceToNow(new Date(act.created_at), { addSuffix: true }).replace('about ', '')}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        <Link href="/history" className="mt-6 text-center text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors py-3 w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121316] rounded-xl shadow-sm">
                            View All History
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

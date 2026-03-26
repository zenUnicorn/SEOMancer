'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Activity, CalendarDays, ExternalLink, Hash } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';

export default function HistoryPage() {
    const { user } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    useEffect(() => {
        async function fetchAllHistory() {
            if (!user) return;
            setLoading(true);
            try {
                // Fetch lightweight scans
                const { data: scans } = await supabase
                    .from('scans')
                    .select('id, url, created_at, score')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                // Fetch lightweight gap analyses
                const { data: gaps } = await supabase
                    .from('gap_analyses')
                    .select('id, url_a, url_b, created_at, score_a, score_b')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                // Map and merge
                const merged = [
                    ...(scans || []).map(s => ({ ...s, type: 'scan' })),
                    ...(gaps || []).map(g => ({ ...g, type: 'gap' }))
                ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                setActivities(merged);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchAllHistory();
    }, [user]);

    // Pagination Logic
    const totalItems = activities.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentActivities = activities.slice(startIndex, startIndex + itemsPerPage);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(p => p + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1);
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full font-sans min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-baseline justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-heading tracking-tight flex items-center gap-3">
                        History
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        Log of all your past scans and competitor gap analyses.
                    </p>
                </div>
                <div className="bg-white dark:bg-[#121316] border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-2xl shadow-sm text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Activity size={16} className="text-indigo-500" />
                    Total Records: {totalItems}
                </div>
            </div>

            <div className="bg-white dark:bg-[#121316] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 animate-pulse text-gray-400 dark:text-gray-600 gap-3">
                        <Activity size={32} />
                        <span className="font-bold text-sm tracking-widest uppercase">Fetching Records</span>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 gap-3">
                        <span className="font-bold text-sm">No historical data found.</span>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-[#1a1c23] border-b border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4 whitespace-nowrap">Type</th>
                                        <th className="px-6 py-4">Analyzed Targets</th>
                                        <th className="px-6 py-4">Score</th>
                                        <th className="px-6 py-4 text-right">Date Executed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentActivities.map((act) => (
                                        <tr key={act.id + act.type} className="border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                                                    act.type === 'scan' 
                                                    ? 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50' 
                                                    : 'bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50'
                                                }`}>
                                                    {act.type === 'scan' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                                    {act.type === 'scan' ? 'Scan' : 'Gap Analysis'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {act.type === 'scan' ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-900 dark:text-white text-sm">{act.url}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                                                        <span>{act.url_a}</span>
                                                        <span className="text-gray-400 mx-1">vs</span>
                                                        <span>{act.url_b}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-mono">
                                                    <Hash size={10} /> {act.id}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {act.type === 'scan' ? (
                                                    <span className="font-black text-gray-900 dark:text-white">{act.score}<span className="text-gray-400 font-bold ml-1">/100</span></span>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-white">
                                                        <span>{act.score_a}</span> : <span>{act.score_b}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{format(new Date(act.created_at), 'MMM d, yyyy')}</span>
                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        <CalendarDays size={12} /> {formatDistanceToNow(new Date(act.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Footer */}
                        <div className="mt-auto px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-[#1a1c23]">
                            <p className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems}
                            </p>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handlePrev} 
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#121316] text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-bold text-gray-900 dark:text-white px-3">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button 
                                    onClick={handleNext} 
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#121316] text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

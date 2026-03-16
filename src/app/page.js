import Link from "next/link";
import { ArrowUpRight, Rocket } from "lucide-react";

export default function Overview() {
    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-baseline justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-heading tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Your active workspace to manage SEO projects and scans.
                    </p>
                </div>
                <div className="flex items-center gap-3 pr-0">
                    <Link href="/scan" className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-full hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-sm">
                        <span className="text-lg leading-none">+</span> New Scan
                    </Link>
                    <Link href="/gap-analysis" className="px-5 py-2.5 bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        Gap Analysis
                    </Link>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Scans - Dark accent */}
                <div className="bg-gray-900 dark:bg-white rounded-3xl p-6 text-white dark:text-gray-900 flex flex-col justify-between shadow-sm relative overflow-hidden h-40">
                    <div className="flex justify-between items-start mb-2 z-10">
                        <span className="text-sm font-medium opacity-90">Total Scans</span>
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center">
                            <ArrowUpRight size={16} />
                        </div>
                    </div>
                    <div className="z-10 mt-auto">
                        <h2 className="text-5xl font-semibold tracking-tight font-heading mb-3">24</h2>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500">
                            <span className="bg-white/20 dark:bg-gray-900/20 px-1.5 py-0.5 rounded text-white dark:text-gray-900 flex items-center gap-1">5 <ArrowUpRight size={10} /></span>
                            <span>Increased from last month</span>
                        </div>
                    </div>
                </div>

                {/* Optimizations Done */}
                <div className="bg-white dark:bg-[#1e1e28] rounded-3xl p-6 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white flex flex-col justify-between shadow-sm h-40">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Optimizations Done</span>
                        <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <ArrowUpRight size={16} />
                        </div>
                    </div>
                    <div className="mt-auto">
                        <h2 className="text-5xl font-semibold tracking-tight font-heading mb-3 text-gray-900 dark:text-white">10</h2>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 px-1.5 py-0.5 rounded flex items-center gap-1">6 <ArrowUpRight size={10} /></span>
                            <span>Increased from last month</span>
                        </div>
                    </div>
                </div>

                {/* Average SEO Score */}
                <div className="bg-white dark:bg-[#1e1e28] rounded-3xl p-6 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white flex flex-col justify-between shadow-sm h-40">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg. SEO Score</span>
                        <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <ArrowUpRight size={16} />
                        </div>
                    </div>
                    <div className="mt-auto">
                        <h2 className="text-5xl font-semibold tracking-tight font-heading mb-3 text-gray-900 dark:text-white">85</h2>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <span>Excellent Standing</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Project Analytics Chart */}
                <div className="bg-white dark:bg-[#1e1e28] rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Project Analytics</h3>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-600">Active</span>
                    </div>
                    <div className="flex justify-between items-end h-40 gap-3 mt-4 px-2">
                        {/* S */}
                        <div className="flex flex-col items-center gap-3 flex-1 relative h-full justify-end">
                            <div className="w-full h-[60%] rounded-[20px] bg-stripes opacity-50"></div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">S</span>
                        </div>
                        {/* M */}
                        <div className="flex flex-col items-center gap-3 flex-1 relative h-full justify-end">
                            <div className="w-full h-[85%] rounded-[20px] bg-gray-800 dark:bg-gray-300"></div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">M</span>
                        </div>
                        {/* T */}
                        <div className="flex flex-col items-center gap-3 flex-1 relative h-full justify-end">
                            <div className="absolute top-0 text-[10px] text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-600">74%</div>
                            <div className="w-full h-[70%] rounded-[20px] bg-gray-400 dark:bg-gray-500"></div>
                            <span className="text-xs text-gray-900 dark:text-white font-semibold">T</span>
                        </div>
                        {/* W */}
                        <div className="flex flex-col items-center gap-3 flex-1 relative h-full justify-end">
                            <div className="w-full h-[100%] rounded-[20px] bg-gray-900 dark:bg-white"></div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">W</span>
                        </div>
                        {/* T */}
                        <div className="flex flex-col items-center gap-3 flex-1 relative h-full justify-end">
                            <div className="w-full h-[55%] rounded-[20px] bg-stripes opacity-50"></div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">T</span>
                        </div>
                        {/* F */}
                        <div className="flex flex-col items-center gap-3 flex-1 relative h-full justify-end">
                            <div className="w-full h-[40%] rounded-[20px] bg-stripes opacity-50"></div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">F</span>
                        </div>
                        {/* S */}
                        <div className="flex flex-col items-center gap-3 flex-1 relative h-full justify-end">
                            <div className="w-full h-[65%] rounded-[20px] bg-stripes opacity-50"></div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">S</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white dark:bg-[#1e1e28] rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Recent Activities</h3>
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-6 min-h-[160px]">
                        <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-gray-200 dark:border-gray-700">
                            <Rocket className="text-gray-400 dark:text-gray-500" size={24} />
                        </div>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">No History Yet</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-[220px]">
                            Run your first query to see your past scans populate here.
                        </p>
                        <Link href="/scan" className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-full hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors inline-block shadow-sm">
                            Run First Scan
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

import Link from "next/link";
import { GitCompareArrows } from "lucide-react";

export default function GapAnalysis() {
    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full text-center flex flex-col items-center justify-center h-full">
            <div className="bg-gray-100 p-6 rounded-full text-gray-500 mb-6">
                <GitCompareArrows size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 font-heading mb-4">
                Gap Analysis Module
            </h1>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
                This page acts as a placeholder for the future Standalone Gap Analysis feature, where you can compare different competitors side-by-side using advanced metrics.
            </p>
            <Link href="/scan" className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-black transition-colors">
                Try the Mini Gap Tracker inside Scan
            </Link>
        </div>
    );
}

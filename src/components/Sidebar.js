"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    Home01Icon,
    Search01Icon,
    ChartLineData01Icon,
    Menu01Icon,
    Cancel01Icon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Logout01Icon
} from "hugeicons-react";

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navs = [
        { name: "Overview", href: "/", icon: <Home01Icon size={20} /> },
        { name: "Scan", href: "/scan", icon: <Search01Icon size={20} /> },
        { name: "Gap Analysis", href: "/gap-analysis", icon: <ChartLineData01Icon size={20} /> }
    ];

    return (
        <>
            {/* Mobile Header Toggle */}
            <div className="md:hidden fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-lg text-gray-900 font-heading">
                    SEOMancer
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-1">
                    {isOpen ? <Cancel01Icon size={24} /> : <Menu01Icon size={24} />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/20 z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed md:relative inset-y-0 left-0 z-50 bg-[#f9f9fc] md:bg-transparent border-r border-gray-200 transform transition-all duration-300 ease-in-out flex flex-col pt-[70px] md:pt-0 shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    } ${isCollapsed ? 'md:w-20 w-64' : 'w-64'}`}
            >
                <div className={`p-6 hidden md:flex items-center font-black text-2xl font-heading text-gray-900 tracking-tight ${isCollapsed ? 'justify-center px-0 flex-col gap-4' : 'justify-between gap-2'}`}>
                    {!isCollapsed && <span>SEOMancer</span>}
                    {isCollapsed && <span className="text-sm">SM</span>}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                        {isCollapsed ? <ArrowRight01Icon size={20} /> : <ArrowLeft01Icon size={20} />}
                    </button>
                </div>

                <div className="flex-1 px-4 space-y-1 mt-2">
                    {!isCollapsed && <p className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Workspace</p>}
                    {navs.map((nav) => {
                        const isActive = pathname === nav.href;
                        return (
                            <Link
                                key={nav.name}
                                href={nav.href}
                                onClick={() => setIsOpen(false)}
                                title={isCollapsed ? nav.name : undefined}
                                className={`flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'
                                    } ${isActive
                                        ? 'bg-gray-200 text-black shadow-sm font-semibold'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                                    }`}
                            >
                                {nav.icon}
                                {!isCollapsed && <span>{nav.name}</span>}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4">
                    <button
                        className={`w-full py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors rounded-lg flex items-center justify-center gap-2 ${isCollapsed ? 'px-0' : ''}`}
                        title={isCollapsed ? "Sign Out" : undefined}
                    >
                        {isCollapsed ? <Logout01Icon size={20} /> : "Sign Out"}
                    </button>
                </div>
            </aside>
        </>
    );
}

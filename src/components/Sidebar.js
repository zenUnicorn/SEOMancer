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
import ThemeToggle from "./ThemeToggle";

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
            <div className="md:hidden fixed top-0 left-0 w-full bg-white dark:bg-[#1a1a22] border-b border-gray-200 dark:border-gray-800 z-50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white font-heading">
                    SEOMancer
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle compact />
                    <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-300 p-1">
                        {isOpen ? <Cancel01Icon size={24} /> : <Menu01Icon size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed md:relative inset-y-0 left-0 z-50
                    bg-white dark:bg-[#1a1a22]
                    border-r border-gray-200 dark:border-gray-800
                    transform transition-all duration-300 ease-in-out
                    flex flex-col
                    pt-[70px] md:pt-0
                    shrink-0
                    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                    ${isCollapsed ? "md:w-[72px] w-64" : "w-64"}
                `}
            >
                {/* Logo / Brand */}
                <div className={`px-5 py-5 hidden md:flex items-center font-black text-xl font-heading text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-gray-800 ${isCollapsed ? "justify-center" : "justify-between"}`}>
                    {!isCollapsed && <span>SEOMancer</span>}
                    {isCollapsed && <span className="text-sm">SM</span>}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 transition-colors"
                    >
                        {isCollapsed ? <ArrowRight01Icon size={18} /> : <ArrowLeft01Icon size={18} />}
                    </button>
                </div>

                {/* Nav Items */}
                <div className="flex-1 px-3 py-4 space-y-1">
                    {!isCollapsed && (
                        <p className="px-2 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-3">
                            Workspace
                        </p>
                    )}
                    {navs.map((nav) => {
                        const isActive = pathname === nav.href;
                        return (
                            <Link
                                key={nav.name}
                                href={nav.href}
                                onClick={() => setIsOpen(false)}
                                title={isCollapsed ? nav.name : undefined}
                                className={`
                                    flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all
                                    ${isCollapsed ? "justify-center px-2" : "px-3"}
                                    ${isActive
                                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md font-semibold"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }
                                `}
                            >
                                <span className={`shrink-0 ${isActive ? "text-white dark:text-gray-900" : "text-gray-500 dark:text-gray-400"}`}>
                                    {nav.icon}
                                </span>
                                {!isCollapsed && <span>{nav.name}</span>}
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom Area: Theme toggle + Sign Out */}
                <div className="px-3 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                    {!isCollapsed ? (
                        <ThemeToggle />
                    ) : (
                        <ThemeToggle compact />
                    )}
                    <button
                        className={`
                            w-full py-2.5 text-sm font-medium
                            text-red-500 dark:text-red-400
                            bg-red-50 dark:bg-red-950/40
                            hover:bg-red-100 dark:hover:bg-red-900/40
                            transition-colors rounded-xl
                            flex items-center justify-center gap-2
                            ${isCollapsed ? "px-2" : "px-3"}
                        `}
                        title={isCollapsed ? "Sign Out" : undefined}
                    >
                        <Logout01Icon size={18} />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}

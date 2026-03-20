/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, ChevronUp } from "lucide-react";
import {
    Home01Icon,
    Search01Icon,
    ChartLineData01Icon,
    Menu01Icon,
    Cancel01Icon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Logout01Icon,
    PenTool01Icon
} from "hugeicons-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup';
    
    // Fetch authenticated active user variables straight from context layer effortlessly
    const { user } = useAuth();
    
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navs = [
        { name: "Overview", href: "/dashboard", icon: <Home01Icon size={20} /> },
        { name: "Scan", href: "/scan", icon: <Search01Icon size={20} /> },
        { name: "Gap Analysis", href: "/gap-analysis", icon: <ChartLineData01Icon size={20} /> },
        { name: "Live Editor", href: "/editor", icon: <PenTool01Icon size={20} /> },
    ];

    const handleSignOut = async () => {
        setIsProfileOpen(false);
        await supabase.auth.signOut();
        // Provider cleanly handles redirect context loop here
    };

    if (isAuthPage) return null;

    return (
        <>
            {/* Mobile Header Toggle */}
            <div className="md:hidden fixed top-0 left-0 w-full bg-white dark:bg-[#1a1a22] border-b border-gray-200 dark:border-gray-800 z-50 px-4 py-3 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center shrink-0">
                    <img src="/logo-light.svg" alt="SEOMancer" className="h-6 w-auto dark:hidden" />
                    <img src="/logo-dark.svg" alt="SEOMancer" className="h-6 w-auto hidden dark:block" />
                </Link>
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
                <div className={`py-[18px] hidden md:flex border-b border-gray-100 dark:border-gray-800 ${isCollapsed ? "flex-col items-center justify-center gap-4" : "items-center justify-between px-5"}`}>
                    {!isCollapsed ? (
                        <Link href="/dashboard" className="flex items-center shrink-0">
                            <img src="/logo-light.svg" alt="SEOMancer" className="h-6 w-auto dark:hidden" />
                            <img src="/logo-dark.svg" alt="SEOMancer" className="h-6 w-auto hidden dark:block" />
                        </Link>
                    ) : (
                        <Link href="/dashboard" className="flex items-center shrink-0">
                            <img src="/icon-only-light.svg" alt="SEOMancer" className="h-6 w-6 dark:hidden" />
                            <img src="/icon-only-dark.svg" alt="SEOMancer" className="h-6 w-6 hidden dark:block" />
                        </Link>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 transition-colors shrink-0"
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

                {/* Bottom Area: Theme toggle + Profile Section */}
                <div className="px-3 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3 relative">
                    {!isCollapsed ? (
                        <ThemeToggle />
                    ) : (
                        <ThemeToggle compact />
                    )}
                    
                    <div className="relative" ref={profileRef}>
                        {/* Popover Menu */}
                        {isProfileOpen && (
                            <div className={`
                                absolute bottom-full mb-2 left-0
                                bg-white dark:bg-[#1a1a22]
                                border border-gray-200 dark:border-gray-800
                                rounded-xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.1)]
                                dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.3)]
                                py-1.5 z-50 overflow-hidden
                                transition-all
                                ${isCollapsed ? "w-12 ml-px" : "w-full min-w-[200px]"}
                            `}>
                                <Link 
                                    href="/settings"
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 text-sm font-medium
                                        text-gray-600 dark:text-gray-300
                                        hover:bg-gray-100 dark:hover:bg-gray-800
                                        transition-colors w-full text-left
                                        ${isCollapsed ? "justify-center px-0" : ""}
                                    `}
                                    onClick={() => setIsProfileOpen(false)}
                                    title={isCollapsed ? "Settings" : undefined}
                                >
                                    <Settings size={18} />
                                    {!isCollapsed && <span>Settings</span>}
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 text-sm font-medium
                                        text-red-500 dark:text-red-400
                                        hover:bg-red-50 dark:hover:bg-red-950/40
                                        transition-colors w-full text-left
                                        ${isCollapsed ? "justify-center px-0" : ""}
                                    `}
                                    title={isCollapsed ? "Sign Out" : undefined}
                                >
                                    <LogOut size={18} />
                                    {!isCollapsed && <span>Sign Out</span>}
                                </button>
                            </div>
                        )}

                        {/* Profile Button */}
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`
                                w-full py-2 flex items-center gap-3 rounded-xl
                                hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                                ${isCollapsed ? "justify-center px-0" : "px-3"}
                                ${isProfileOpen ? "bg-gray-100 dark:bg-gray-800" : ""}
                            `}
                            title={isCollapsed ? "Profile" : undefined}
                        >
                            <div className="w-[34px] h-[34px] rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-200 dark:border-indigo-800/50">
                                <User size={18} strokeWidth={2.5} />
                            </div>
                            
                            {!isCollapsed && (
                                <>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate leading-tight">
                                            {user?.user_metadata?.first_name 
                                                ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` 
                                                : "User Account"
                                            }
                                        </p>
                                        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                            {user?.email || "user@example.com"}
                                        </p>
                                    </div>
                                    <div className={`text-gray-400 shrink-0 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}>
                                        <ChevronUp size={16} />
                                    </div>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

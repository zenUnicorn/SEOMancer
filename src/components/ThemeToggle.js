"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ compact = false }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const toggle = () => setTheme(isDark ? "light" : "dark");

  if (compact) {
    return (
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    );
  }

  return (
    <div
      onClick={toggle}
      aria-label="Toggle theme"
      role="button"
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600">
        {isDark ? (
          <Sun size={14} className="text-amber-500" />
        ) : (
          <Moon size={14} className="text-indigo-500" />
        )}
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>
      {/* Toggle pill */}
      <div className={`w-9 h-5 rounded-full flex items-center transition-colors px-0.5 ${isDark ? "bg-indigo-500" : "bg-gray-300"}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${isDark ? "translate-x-4" : "translate-x-0"}`} />
      </div>
    </div>
  );
}

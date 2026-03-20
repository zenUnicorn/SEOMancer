"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    bar: "bg-green-500",
    iconCls: "text-green-500",
    border: "border-green-100 dark:border-green-900/40",
  },
  error: {
    icon: XCircle,
    bar: "bg-red-500",
    iconCls: "text-red-500",
    border: "border-red-100 dark:border-red-900/40",
  },
  warning: {
    icon: AlertTriangle,
    bar: "bg-amber-400",
    iconCls: "text-amber-500",
    border: "border-amber-100 dark:border-amber-900/40",
  },
  info: {
    icon: Info,
    bar: "bg-gray-400",
    iconCls: "text-gray-400",
    border: "border-gray-100 dark:border-gray-800",
  },
};

// ─── Single toast ─────────────────────────────────────────────────────────────
function Toast({ id, type = "info", title, message, onClose }) {
  const cfg = TOAST_CONFIG[type] || TOAST_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}
      className={`relative w-full max-w-[360px] bg-white/90 dark:bg-[#1e1e28]/90 backdrop-blur-xl rounded-[20px] border ${cfg.border} shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col`}
    >
      {/* Dynamic progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-100 dark:bg-gray-800/50">
        <motion.div
          className={`h-full ${cfg.bar} shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 4, ease: "linear" }}
        />
      </div>

      <div className="flex items-start gap-4 p-5">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${cfg.border} bg-gray-50/50 dark:bg-white/5`}>
          <Icon size={20} className={cfg.iconCls} />
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          {title && (
            <p className="text-[13px] font-black text-gray-900 dark:text-white leading-tight tracking-tight uppercase">{title}</p>
          )}
          {message && (
            <p className="text-[12px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
              {message}
            </p>
          )}
        </div>

        <button
          onClick={() => onClose(id)}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-xl text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90"
          aria-label="Dismiss"
        >
          <X size={14} strokeWidth={3} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback(({ type = "info", title, message, duration = 4000 }) => {
    const id = ++counterRef.current;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  // Convenience helpers
  const success = useCallback((title, message) => toast({ type: "success", title, message }), [toast]);
  const error   = useCallback((title, message) => toast({ type: "error", title, message, duration: 6000 }), [toast]);
  const warning = useCallback((title, message) => toast({ type: "warning", title, message }), [toast]);
  const info    = useCallback((title, message) => toast({ type: "info", title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
      {children}

      {/* Toast container — top-right, above everything */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast {...t} onClose={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

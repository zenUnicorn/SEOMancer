"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  ShieldBan, 
  Bell, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Power, 
  Mail, 
  Smartphone,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Mock State for Exclusions
  const [newExclusion, setNewExclusion] = useState("");
  const [exclusions, setExclusions] = useState([
    { id: 1, domain: "competitor.com", active: true },
    { id: 2, domain: "oldsite.net", active: false }
  ]);

  // Mock State for Notifications
  const [notifications, setNotifications] = useState([
    { id: "email_reports", title: "Weekly Email Reports", desc: "Receive automated gap-analysis summaries.", active: true, icon: Mail },
    { id: "scan_alerts", title: "Scan Completion Alerts", desc: "Push notification when a long scan finishes.", active: false, icon: Smartphone },
    { id: "security_alerts", title: "Security Alerts", desc: "Get notified of suspicious login attempts.", active: true, icon: ShieldAlert }
  ]);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "exclusions", label: "Scan Exclusions", icon: ShieldBan },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle }
  ];

  const handleAddExclusion = (e) => {
    e.preventDefault();
    if (!newExclusion.trim()) return;
    setExclusions([{ id: Date.now(), domain: newExclusion.trim(), active: true }, ...exclusions]);
    setNewExclusion("");
  };

  const toggleExclusion = (id) => {
    setExclusions(exclusions.map(ex => ex.id === id ? { ...ex, active: !ex.active } : ex));
  };

  const deleteExclusion = (id) => {
    setExclusions(exclusions.filter(ex => ex.id !== id));
  };

  const toggleNotification = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, active: !n.active } : n));
  };

  return (
    <div className="w-full min-h-full flex items-center justify-center py-10 px-4 font-sans">
      
      {/* Main Settings Modal Container */}
      <div className="w-full max-w-4xl bg-white dark:bg-[#121316] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        
        {/* Sidebar Tabs */}
        <div className="md:w-64 bg-gray-50 dark:bg-[#0f0f12] border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">Settings</h2>
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all shrink-0 md:shrink border
                    ${isActive 
                      ? "bg-white dark:bg-[#1a1c23] text-gray-900 dark:text-white shadow-sm border-gray-200 dark:border-gray-700" 
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 border-transparent"
                    }
                    ${tab.id === 'danger' && isActive ? "text-red-500 dark:text-red-400 border-red-100 dark:border-red-900/30" : ""}
                  `}
                >
                  <Icon size={18} className={tab.id === 'danger' && !isActive ? "text-red-400/70" : ""} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-6 md:p-10 bg-white dark:bg-[#121316] relative overflow-y-auto w-full">
          <AnimatePresence mode="wait">
            
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 max-w-xl"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Profile Details</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">View and update your personal information.</p>
                </div>
                
                <div className="space-y-5 pt-4">
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={user?.user_metadata?.first_name || ""} 
                        className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none text-gray-500"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={user?.user_metadata?.last_name || ""} 
                        className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none text-gray-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                    <input 
                      type="email" 
                      readOnly 
                      value={user?.email || ""} 
                      className="w-full bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none text-gray-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* BLOCKLIST / EXCLUSIONS TAB */}
            {activeTab === "exclusions" && (
              <motion.div
                key="exclusions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 max-w-2xl"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Scan Exclusions</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Add domains you explicitly wish to block from SEOMancer scanning algorithms.</p>
                </div>

                <form onSubmit={handleAddExclusion} className="flex gap-3 pt-2">
                  <input 
                    type="text" 
                    placeholder="e.g. internal-staging.com" 
                    value={newExclusion}
                    onChange={(e) => setNewExclusion(e.target.value)}
                    className="flex-1 bg-white dark:bg-[#0f0f12] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8c40ff] focus:ring-1 focus:ring-[#8c40ff] transition-colors"
                  />
                  <button type="submit" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                    <Plus size={18} />
                    Add
                  </button>
                </form>

                <div className="bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden mt-6">
                  {exclusions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">No domains excluded currently.</div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                      {exclusions.map((exclusion) => (
                        <div key={exclusion.id} className="p-4 flex items-center justify-between hover:bg-white dark:hover:bg-[#1e2028] transition-colors">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => toggleExclusion(exclusion.id)}
                              className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${exclusion.active ? 'bg-[#8c40ff]' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${exclusion.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </button>
                            <span className={`text-sm font-medium ${exclusion.active ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 line-through'}`}>
                              {exclusion.domain}
                            </span>
                          </div>
                          <button 
                            onClick={() => deleteExclusion(exclusion.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 max-w-2xl"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Notification Preferences</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Control what alerts and scheduled reports you receive.</p>
                </div>

                <div className="space-y-4 pt-4">
                  {notifications.map((notif) => {
                    const Icon = notif.icon;
                    return (
                      <div key={notif.id} className="flex items-center justify-between p-5 bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                            <Icon size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{notif.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.desc}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleNotification(notif.id)}
                          className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out relative shrink-0 ${notif.active ? 'bg-[#8c40ff]' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${notif.active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* DANGER ZONE TAB */}
            {activeTab === "danger" && (
              <motion.div
                key="danger"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 max-w-xl"
              >
                <div>
                  <h3 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-1">Danger Zone</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Irreversible and destructive actions concerning your account.</p>
                </div>

                <div className="mt-6 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/5 rounded-2xl p-6 space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Delete Account</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                      Permanently delete your account and all associated scan data, gap analyses, and active blocklists. This action is terminal and cannot be reversed.
                    </p>
                  </div>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm w-full md:w-auto">
                    Permanently Delete Account
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

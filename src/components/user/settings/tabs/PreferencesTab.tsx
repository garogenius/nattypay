"use client";

import React from "react";

const Toggle: React.FC<{checked: boolean; onToggle: () => void}> = ({ checked, onToggle }) => (
  <button onClick={onToggle} className={`relative w-12 h-6 rounded-full ${checked ? "bg-[#D4B139]" : "bg-white/20"}`}>
    <span className={`absolute top-0.5 ${checked ? "right-0.5" : "left-0.5"} w-5 h-5 rounded-full bg-white transition-all`} />
  </button>
);

const PreferencesTab: React.FC = () => {
  const [prefs, setPrefs] = React.useState({
    transactions: true,
    services: true,
    updates: true,
    messages: false,
    email: true,
    sms: true,
    darkMode: false,
  });

  // Initialize dark mode from storage or system preference
  React.useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
      const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = saved ? saved === 'dark' : prefersDark;
      setPrefs(p => ({ ...p, darkMode: isDark }));
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.classList.toggle('dark', isDark);
      }
    } catch {}
  }, []);

  const toggle = (k: keyof typeof prefs) => {
    setPrefs(p => {
      const next = { ...p, [k]: !p[k] } as typeof p;
      if (k === 'darkMode') {
        const isDark = next.darkMode;
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', isDark);
        }
        try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch {}
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Notifications */}
      <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
        <p className="text-white font-semibold mb-3">Notifications</p>
        <div className="divide-y divide-white/10">
          {[{
            k: "transactions", t: "Transactions", d: "Payments, transfers and account activities"
          },{
            k: "services", t: "Services", d: "Subscriptions, purchases and service related actions"
          },{
            k: "updates", t: "Updates", d: "New features, announcements and important alerts"
          },{
            k: "messages", t: "Messages", d: "Personal notes, reminders and direct communication"
          },{
            k: "email", t: "Email Notifications", d: "Receive transaction alerts via email"
          },{
            k: "sms", t: "SMS Notifications", d: "Receive transaction alerts via SMS"
          }].map((row: any, i: number) => (
            <div key={i} className="w-full flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-white text-sm sm:text-base font-medium">{row.t}</p>
                <p className="text-white/60 text-xs sm:text-sm">{row.d}</p>
              </div>
              <Toggle checked={(prefs as any)[row.k]} onToggle={() => toggle(row.k)} />
            </div>
          ))}
        </div>
      </div>

      {/* Themes */}
      <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
        <p className="text-white font-semibold mb-3">Themes</p>
        <div className="divide-y divide-white/10">
          <div className="w-full flex items-center justify-between gap-3 py-3">
            <div>
              <p className="text-white text-sm sm:text-base font-medium">Dark Mode</p>
              <p className="text-white/60 text-xs sm:text-sm">Switch to dark theme</p>
            </div>
            <Toggle checked={prefs.darkMode} onToggle={() => toggle("darkMode")} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesTab;

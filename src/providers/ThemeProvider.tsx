"use client";

import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Get theme from localStorage or system preference
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    // Apply theme (redundant but ensures it's set)
    if (isDark) {
      document.documentElement.setAttribute("data-mode", "dark");
      document.documentElement.className = "dark";
    } else {
      document.documentElement.setAttribute("data-mode", "light");
      document.documentElement.className = "";
    }

    // Listen for theme changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const newTheme = e.newValue;
        if (newTheme === 'dark') {
          document.documentElement.setAttribute("data-mode", "dark");
          document.documentElement.className = "dark";
        } else {
          document.documentElement.setAttribute("data-mode", "light");
          document.documentElement.className = "";
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom theme change event
    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem('theme');
      if (currentTheme === 'dark') {
    document.documentElement.setAttribute("data-mode", "dark");
    document.documentElement.className = "dark";
      } else {
        document.documentElement.setAttribute("data-mode", "light");
        document.documentElement.className = "";
      }
    };

    window.addEventListener('themechange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);

  return <>{children}</>;
}

"use client";

import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Always use dark theme
    document.documentElement.setAttribute("data-mode", "dark");
    document.documentElement.className = "dark";
  }, []);

  return <>{children}</>;
}

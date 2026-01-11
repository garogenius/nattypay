"use client";

import React, { useEffect } from "react";

/**
 * Onboarding/Auth pages should not support theme switching.
 * We force a stable LIGHT theme for the /(auth) route segment, and restore the
 * user's previous theme when leaving.
 */
export default function AuthThemeGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;

    const hadDarkClass = html.classList.contains("dark");
    const prevDataMode = html.getAttribute("data-mode");

    // Force light mode for auth/onboarding
    html.classList.remove("dark");
    html.setAttribute("data-mode", "light");
    html.setAttribute("data-auth-onboarding", "true");

    return () => {
      html.removeAttribute("data-auth-onboarding");

      if (hadDarkClass) html.classList.add("dark");
      else html.classList.remove("dark");

      if (prevDataMode) html.setAttribute("data-mode", prevDataMode);
      else html.removeAttribute("data-mode");
    };
  }, []);

  return <>{children}</>;
}



"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeProvider({ children, ...props }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stability fix: Always render NextThemesProvider to maintain a consistent hook count in React 19.
  // The suppressHydrationWarning handles the mismatched attributes during the mount phase.
  return (
    <NextThemesProvider {...props}>
      <div style={{ visibility: mounted ? "visible" : "hidden" }} className="contents">
        {children}
      </div>
    </NextThemesProvider>
  );
}

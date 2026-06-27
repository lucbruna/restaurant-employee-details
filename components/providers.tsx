"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="bhukkad-theme"
      >
        {children}
        <Toaster position="top-right" richColors theme="system" />
      </ThemeProvider>
    </SessionProvider>
  );
}

"use client";

import { useSyncExternalStore } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-10 w-10 rounded-full border-border/70 bg-card/80"
        aria-label="Alternar tema"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      className="h-10 w-10 rounded-full border-border/70 bg-card/80"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Alternar para modo claro" : "Alternar para modo escuro"}
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    </Button>
  );
}

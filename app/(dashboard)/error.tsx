"use client";

import { StatePanel } from "@/components/ui/state-panel";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="app-canvas flex min-h-screen items-center justify-center bg-background p-4 md:p-6">
      <StatePanel
        eyebrow="Bhukkad Operations"
        tone="error"
        title="This operating surface could not finish loading."
        description={
          error?.message ||
          "We kept the dashboard shell online and isolated the failure to this route. Retry the panel, or drop back to the main dashboard while the fallback keeps the rest of the workspace available."
        }
        primaryAction={{ label: "Retry surface", onClick: reset }}
        secondaryAction={{ label: "Back to dashboard", href: "/dashboard", variant: "outline" }}
        className="w-full max-w-5xl"
      />
    </div>
  );
}

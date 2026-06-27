"use client";

import { StatePanel } from "@/components/ui/state-panel";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background px-6 py-8 sm:px-8">
        <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
          <StatePanel
            eyebrow="Bhukkad Recovery"
            tone="error"
            title="Service interrupted, fallback is active."
            description={
              error?.message ||
              "We hit an unexpected issue while assembling this view. The safest recovery path is ready, and you can retry immediately without leaving the operating flow."
            }
            primaryAction={{ label: "Retry view", onClick: reset }}
            secondaryAction={{ label: "Open dashboard", href: "/dashboard", variant: "outline" }}
            className="w-full"
          />
        </main>
      </body>
    </html>
  );
}

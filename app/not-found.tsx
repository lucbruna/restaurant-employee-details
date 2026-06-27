import { StatePanel } from "@/components/ui/state-panel";

export default function NotFound() {
  return (
    <main className="app-canvas flex min-h-screen items-center justify-center bg-background px-6 py-8 sm:px-8">
      <StatePanel
        eyebrow="Bhukkad Navigation"
        tone="empty"
        title="This route is not on the service board."
        description="The page may have moved, expired, or never existed in this workspace. The quickest recovery path is to return to the live dashboard and continue from an active operating surface."
        primaryAction={{ label: "Open dashboard", href: "/dashboard" }}
        secondaryAction={{ label: "Launch tablet ordering", href: "/tablet-ordering", variant: "outline" }}
        className="w-full max-w-5xl"
      />
    </main>
  );
}

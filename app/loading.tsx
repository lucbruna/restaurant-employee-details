import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="app-canvas min-h-screen bg-background px-6 py-8 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="app-panel-subtle rounded-[var(--radius-xxl)] p-6 sm:p-8">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-32 rounded-full bg-surface-container" />
            <Skeleton className="h-12 w-64 rounded-[var(--radius-large)] bg-surface-container" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-surface-container" />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="app-panel rounded-[var(--radius-xxl)] p-6 sm:p-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="app-panel-subtle rounded-[var(--radius-xl)] p-5"
                >
                  <Skeleton className="mb-4 h-10 w-10 rounded-[var(--radius-large)] bg-surface-container" />
                  <Skeleton className="mb-3 h-6 w-24 rounded-full bg-surface-container" />
                  <Skeleton className="h-4 w-full rounded-full bg-surface-container" />
                </div>
              ))}
            </div>
          </div>

          <div className="app-panel rounded-[var(--radius-xxl)] p-6 sm:p-8">
            <Skeleton className="mb-4 h-7 w-36 rounded-full bg-surface-container" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-20 rounded-[var(--radius-large)] bg-surface-container"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

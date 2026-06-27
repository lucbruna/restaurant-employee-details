import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="app-canvas min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <div className="app-panel-subtle rounded-[var(--radius-xxl)] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-4 w-28 rounded-full bg-surface-container" />
              <Skeleton className="h-10 w-60 rounded-[var(--radius-large)] bg-surface-container" />
            </div>
            <Skeleton className="h-11 w-40 rounded-[var(--radius-large)] bg-surface-container" />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="app-panel rounded-[var(--radius-xxl)] p-6">
              <Skeleton className="mb-4 h-5 w-24 rounded-full bg-surface-container" />
              <Skeleton className="mb-3 h-10 w-32 rounded-[var(--radius-large)] bg-surface-container" />
              <Skeleton className="h-4 w-full rounded-full bg-surface-container" />
            </div>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
          <div className="app-panel rounded-[var(--radius-xxl)] p-6">
            <Skeleton className="mb-5 h-6 w-40 rounded-full bg-surface-container" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-24 rounded-[var(--radius-xl)] bg-surface-container"
                />
              ))}
            </div>
          </div>
          <div className="app-panel rounded-[var(--radius-xxl)] p-6">
            <Skeleton className="mb-5 h-6 w-32 rounded-full bg-surface-container" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-16 rounded-[var(--radius-large)] bg-surface-container"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

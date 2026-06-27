import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
  withTagline?: boolean;
};

export function BrandMark({
  className,
  compact = false,
  withTagline = false,
}: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-[calc(var(--radius-xl)-2px)] border border-white/18 bg-[linear-gradient(145deg,var(--color-primary-light),var(--color-primary),var(--color-primary-dark))] text-primary-foreground shadow-[var(--shadow-brand)]",
          compact ? "h-11 w-11" : "h-12 w-12"
        )}
      >
        <div className="absolute inset-[2px] rounded-[calc(var(--radius-xl)-6px)] border border-white/18 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_55%)]" />
        <span className="brand-script relative text-[1.65rem] font-extrabold leading-none">भ</span>
        <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_0_2px_rgba(255,255,255,0.22)]" />
      </div>
      {!compact && (
        <div className="min-w-0">
          <div className="flex items-end gap-2 leading-none">
            <span className="brand-script text-[1.6rem] font-extrabold text-foreground">भुक्कड़</span>
            <span className="brand-display pb-0.5 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Bhukkad
            </span>
          </div>
          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
            Restaurant OS
          </div>
          {withTagline && (
            <p className="mt-2 max-w-xs text-xs font-medium leading-relaxed text-muted-foreground">
              Expressive restaurant operations for India&apos;s dining rooms, rush-hour kitchens, and service teams.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

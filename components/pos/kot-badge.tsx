import { Receipt } from "lucide-react";

interface KotBadgeProps {
  status: "pending" | "preparing" | "ready" | "served";
  count?: number;
}

export function KotBadge({ status, count }: KotBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20", label: "Pending" };
      case "preparing":
        return { bg: "bg-info/10", text: "text-info", border: "border-info/20", label: "Cooking" };
      case "ready":
        return { bg: "bg-success/10", text: "text-success", border: "border-success/20", label: "Ready" };
      case "served":
        return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", label: "Served" };
      default:
        return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", label: "Unknown" };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-semibold uppercase tracking-wider ${config.bg} ${config.text} ${config.border}`}>
      <Receipt className="w-3.5 h-3.5" />
      <span>{config.label}</span>
      {count !== undefined && count > 1 && (
        <span className="ml-1 px-1.5 py-0.5 rounded-sm bg-background/50 text-[10px]">
          x{count}
        </span>
      )}
    </div>
  );
}

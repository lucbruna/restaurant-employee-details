"use client";

import { Table } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import { Users, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils/currency";

interface TableCardProps {
  table: Table;
  onClick: () => void;
  isSelected?: boolean;
}

function formatOccupiedSince(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return formatDistanceToNow(parsed, { addSuffix: true });
}

export function TableCard({ table, onClick, isSelected }: TableCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-success/10 border-success/30 text-success";
      case "occupied":
        return "bg-warning/12 border-warning/35 text-warning";
      case "reserved":
        return "bg-info/10 border-info/30 text-info";
      case "dirty":
        return "bg-destructive/10 border-destructive/30 text-destructive";
      default:
        return "bg-muted border-border text-muted-foreground";
    }
  };

  const getShapeClass = (shape: string) => {
    switch (shape) {
      case "circle":
        return "rounded-full aspect-square";
      case "rectangle":
        return "rounded-lg aspect-[3/2]";
      case "square":
      default:
        return "rounded-lg aspect-square";
    }
  };

  const isOccupied = table.status === "occupied";
  const activeOrderTotal = Number(table.activeOrderTotal ?? 0);
  const activeGuestCount = Number(table.activeGuestCount ?? 0);
  const occupiedSince = formatOccupiedSince(table.occupiedSince);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`
              relative flex flex-col items-center justify-center p-2 border-2 shadow-sm transition-all
              ${getStatusColor(table.status)}
              ${getShapeClass(table.shape)}
              ${isSelected ? "ring-4 ring-primary/30 ring-offset-2" : ""}
              ${isOccupied ? "animate-pulse-border" : ""}
            `}
            style={{
              width: table.width || 72,
              height: table.height || 72,
            }}
          >
            <span className="text-lg font-bold leading-none">{table.name}</span>
            
            {isOccupied && activeOrderTotal > 0 && (
              <span className="absolute bottom-1 rounded-full border border-border/70 bg-card/90 px-2 py-0.5 text-[10px] font-bold text-text-primary shadow-sm backdrop-blur-sm">
                {formatCurrency(activeOrderTotal)}
              </span>
            )}
            
            {/* Capacity indicators (small dots) */}
            <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-surface border border-border rounded-full shadow-sm">
              <span className="text-[9px] font-bold text-text-secondary">{table.capacity}</span>
            </div>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="top" className="flex flex-col gap-1 p-3">
          <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-2 mb-1">
            <span className="font-bold text-base">Table {table.name}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(table.status)}`}>
              {table.status}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Capacity: {table.capacity}</span>
          </div>
          
          {isOccupied && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Guests: {activeGuestCount}</span>
              </div>
              {occupiedSince ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Seated: {occupiedSince}</span>
                </div>
              ) : null}
              <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between font-bold text-foreground">
                <span>Current Bill:</span>
                <span className="text-primary">{formatCurrency(activeOrderTotal)}</span>
              </div>
            </>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

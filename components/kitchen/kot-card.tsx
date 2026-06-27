"use client";

import { motion } from "motion/react";
import { TimerBadge } from "./timer-badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PlayCircle, Utensils } from "lucide-react";

export function KotCard({ kot, onStatusChange }: { kot: any, onStatusChange: (id: string, status: string) => void }) {
  const isPending = kot.status === 'pending';
  const isPreparing = kot.status === 'preparing';
  const isReady = kot.status === 'ready';

  let bgClass = "bg-[#1A1D24] border-white/10";
  if (isPreparing) bgClass = "bg-info/10 border-info/30";
  if (isReady) bgClass = "bg-success/10 border-success/30";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`rounded-2xl border overflow-hidden flex flex-col shadow-xl ${bgClass}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-lg">
            #{kot.kotNumber}
          </div>
          <div>
            <div className="font-bold text-lg leading-none mb-1">{kot.table?.name || 'Takeaway'}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">
              {kot.orderType?.replace('_', ' ') || 'Order'}
            </div>
          </div>
        </div>
        <TimerBadge startTime={kot.createdAt} />
      </div>

      {/* Items */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {kot.items.map((item: any) => (
          <div key={item.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">
              {item.quantity}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-bold text-lg leading-tight mb-1">{item.itemName}</h3>
              
              {item.modifiers?.length > 0 && (
                <p className="text-sm text-white/60 mb-1">
                  {item.modifiers.map((m: any) => m.modifierName ?? m.name).join(', ')}
                </p>
              )}
              
              {item.itemNote && (
                <div className="bg-warning/20 text-warning px-3 py-2 rounded-lg text-sm font-medium mt-2 border border-warning/20">
                  Note: {item.itemNote}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        {isPending && (
          <Button 
            className="w-full h-14 text-lg font-bold bg-info hover:bg-info/90 text-white shadow-lg shadow-info/20"
            onClick={() => onStatusChange(kot.id, 'preparing')}
          >
            <PlayCircle className="w-6 h-6 mr-2" />
            Start Preparing
          </Button>
        )}
        
        {isPreparing && (
          <Button 
            className="w-full h-14 text-lg font-bold bg-success hover:bg-success/90 text-white shadow-lg shadow-success/20"
            onClick={() => onStatusChange(kot.id, 'ready')}
          >
            <CheckCircle2 className="w-6 h-6 mr-2" />
            Mark Ready
          </Button>
        )}

        {isReady && (
          <Button 
            variant="outline"
            className="w-full h-14 text-lg font-bold border-white/20 text-white hover:bg-white/10"
            onClick={() => onStatusChange(kot.id, 'served')}
          >
            <Utensils className="w-6 h-6 mr-2" />
            Mark Served
          </Button>
        )}
      </div>
    </motion.div>
  );
}

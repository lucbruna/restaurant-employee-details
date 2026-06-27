"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, CheckCircle2, AlertCircle, ChefHat, Timer, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

type TicketItemStatus = "pending" | "preparing" | "ready" | "served" | "cancelled";

interface TicketModifier {
  name: string;
}

interface TicketItem {
  id: string;
  quantity: number;
  name: string;
  status: TicketItemStatus;
  selectedModifiers?: TicketModifier[];
  notes?: string;
}

interface TicketOrder {
  id: string;
  orderNumber: string;
  type: "dine_in" | "takeaway" | "delivery" | "online";
  tableId?: string;
  createdAt: string;
  items: TicketItem[];
}

interface TicketCardProps {
  order: TicketOrder;
  onStatusChange: (orderId: string, itemId: string, status: string) => void;
  onOrderComplete: (orderId: string) => void;
}

export function TicketCard({ order, onStatusChange, onOrderComplete }: TicketCardProps) {
  const [elapsedTime, setElapsedTime] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  // Calculate elapsed time and urgency
  useEffect(() => {
    const updateTime = () => {
      const createdAt = new Date(order.createdAt);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
      
      setElapsedTime(formatDistanceToNow(createdAt, { addSuffix: true }));
      setIsUrgent(diffInMinutes > 15); // Urgent if older than 15 mins
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const allItemsCompleted = order.items.every(item => item.status === "ready" || item.status === "served");
  const hasPendingItems = order.items.some(item => item.status === "pending");
  const hasPreparingItems = order.items.some(item => item.status === "preparing");

  const getTicketColor = () => {
    if (allItemsCompleted) return "border-success bg-success/5";
    if (isUrgent) return "border-destructive bg-destructive/5 animate-pulse-border";
    if (hasPreparingItems) return "border-info bg-info/5";
    return "border-border bg-surface";
  };

  const getHeaderColor = () => {
    if (allItemsCompleted) return "bg-success text-success-foreground";
    if (isUrgent) return "bg-destructive text-destructive-foreground";
    if (hasPreparingItems) return "bg-info text-info-foreground";
    return "bg-muted text-muted-foreground";
  };

  const handleItemClick = (item: TicketItem) => {
    let nextStatus = "preparing";
    if (item.status === "preparing") nextStatus = "ready";
    if (item.status === "ready") nextStatus = "served"; // Optional, usually FOH does this
    
    if (item.status !== "served") {
      onStatusChange(order.id, item.id, nextStatus);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col rounded-xl border-2 shadow-sm overflow-hidden transition-colors ${getTicketColor()}`}
    >
      {/* Ticket Header */}
      <div className={`p-3 flex items-center justify-between ${getHeaderColor()}`}>
        <div className="flex items-center gap-3">
          <span className="text-xl font-black tracking-tight">#{order.orderNumber}</span>
          <Badge variant="secondary" className="bg-background/20 text-current border-none font-bold">
            {order.type.toUpperCase()}
          </Badge>
          {order.tableId && (
            <Badge variant="secondary" className="bg-background/20 text-current border-none font-bold">
              T-{order.tableId}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          {isUrgent ? <AlertCircle className="w-4 h-4 animate-pulse" /> : <Clock className="w-4 h-4" />}
          {elapsedTime}
        </div>
      </div>

      {/* Ticket Items */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[200px]">
        <AnimatePresence>
          {order.items.map((item, index) => (
            <motion.div
              key={`${item.id}-${index}`}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`
                relative p-3 rounded-lg border transition-all cursor-pointer group
                ${item.status === 'ready' ? 'bg-success/10 border-success/30 opacity-70' : ''}
                ${item.status === 'preparing' ? 'bg-info/10 border-info/30 shadow-sm' : ''}
                ${item.status === 'pending' ? 'bg-background border-border hover:border-primary/30' : ''}
              `}
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{item.quantity}x</span>
                    <span className={`font-semibold text-lg ${item.status === 'ready' ? 'line-through text-muted-foreground' : ''}`}>
                      {item.name}
                    </span>
                  </div>
                  
                  {/* Modifiers */}
                  {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                    <ul className="mt-1 ml-6 text-sm text-muted-foreground list-disc">
                      {item.selectedModifiers.map((mod, i) => (
                        <li key={i}>{mod.name}</li>
                      ))}
                    </ul>
                  )}
                  
                  {/* Notes */}
                  {item.notes && (
                    <div className="mt-2 ml-6 p-2 bg-warning/10 border border-warning/20 rounded text-sm text-warning-dark font-medium italic">
                      &quot;{item.notes}&quot;
                    </div>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-background border shadow-sm">
                  {item.status === 'pending' && <Clock className="w-4 h-4 text-muted-foreground" />}
                  {item.status === 'preparing' && <ChefHat className="w-4 h-4 text-info animate-pulse" />}
                  {item.status === 'ready' && <Check className="w-4 h-4 text-success" />}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Ticket Footer */}
      <div className="p-4 border-t border-border bg-background/50 backdrop-blur-sm">
        <Button 
          className="w-full h-12 text-lg font-bold shadow-sm"
          variant={allItemsCompleted ? "default" : hasPreparingItems ? "secondary" : "outline"}
          onClick={() => onOrderComplete(order.id)}
          disabled={!allItemsCompleted && !hasPreparingItems}
        >
          {allItemsCompleted ? (
            <><CheckCircle2 className="w-5 h-5 mr-2" /> Mark Order Ready</>
          ) : hasPreparingItems ? (
            <><Timer className="w-5 h-5 mr-2 animate-pulse" /> Cooking in Progress</>
          ) : (
            "Waiting to Start"
          )}
        </Button>
      </div>
    </motion.div>
  );
}

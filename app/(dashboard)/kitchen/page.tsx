"use client";

import { useState, useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { apiClient } from "@/lib/api-client";
import { KotCard } from "@/components/kitchen/kot-card";
import { TimerBadge } from "@/components/kitchen/timer-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChefHat, Filter, Clock, CheckCircle2, PlayCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

function playNewKotAlert() {
  const AudioContextClass =
    window.AudioContext ??
    (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(880, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.12);

  gainNode.gain.setValueAtTime(0.0001, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.22);

  oscillator.onended = () => {
    void context.close().catch(() => undefined);
  };
}

export default function KitchenPage() {
  const [kots, setKots] = useState<any[]>([]);
  const [filter, setFilter] = useState("all"); // all, dine_in, takeaway, delivery
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchKots() {
      try {
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        const outletId = session?.user?.outletId;

        if (outletId) {
          const socket = getSocket();
          socket.emit("kitchen:join", { outletId });

          socket.on("kot:new", (data) => {
            setKots(prev => [data, ...prev]);
            playNewKotAlert();
            toast("New Order Received!", { icon: "🔔" });
          });

          socket.on("kot:updated", ({ id, status }) => {
            setKots(prev => prev.map(k => k.id === id ? { ...k, status } : k));
          });
        }

        const res = await apiClient.get("/kitchen/kots");
        setKots(res.data);
      } catch (error) {
        toast.error("Failed to load KOTs");
      } finally {
        setIsLoading(false);
      }
    }
    fetchKots();

    return () => {
      const socket = getSocket();
      socket.off("kot:new");
      socket.off("kot:updated");
    };
  }, []);

  const handleStatusChange = async (kotId: string, newStatus: string) => {
    // Optimistic update
    setKots(prev => prev.map(k => k.id === kotId ? { ...k, status: newStatus } : k));
    
    try {
      await apiClient.patch(`/kitchen/kots/${kotId}`, { status: newStatus });
    } catch (error) {
      // Revert on error
      toast.error("Failed to update status");
      // Ideally refetch or revert state
    }
  };

  const filteredKots = kots.filter(k => {
    if (k.status === 'served') return false; // Hide served
    if (filter !== 'all' && k.orderType !== filter) return false;
    return true;
  });

  const pendingCount = kots.filter(k => k.status === 'pending').length;
  const preparingCount = kots.filter(k => k.status === 'preparing').length;
  const readyCount = kots.filter(k => k.status === 'ready').length;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0F1117]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0F1117] text-white">
      {/* Top Stats Bar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <ChefHat className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Kitchen Display</h1>
        </div>

        <div className="flex items-center gap-6">
          <StatBadge icon={<Clock />} label="Pending" count={pendingCount} color="text-warning" />
          <StatBadge icon={<PlayCircle />} label="Preparing" count={preparingCount} color="text-info" />
          <StatBadge icon={<CheckCircle2 />} label="Ready" count={readyCount} color="text-success" />
          <div className="h-8 w-px bg-white/20 mx-2" />
          <div className="flex flex-col items-end">
            <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Avg Prep Time</span>
            <span className="text-lg font-bold font-mono">14m 30s</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-white/5">
        <Filter className="w-4 h-4 text-white/50 mr-2" />
        <FilterChip label="All Orders" active={filter === "all"} onClick={() => setFilter("all")} />
        <FilterChip label="Dine In" active={filter === "dine_in"} onClick={() => setFilter("dine_in")} />
        <FilterChip label="Takeaway" active={filter === "takeaway"} onClick={() => setFilter("takeaway")} />
        <FilterChip label="Delivery" active={filter === "delivery"} onClick={() => setFilter("delivery")} />
      </div>

      {/* KOT Grid */}
      <ScrollArea className="flex-1 p-6">
        {filteredKots.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/30 pt-20">
            <ChefHat className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">No active orders</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 pb-20">
            <AnimatePresence mode="popLayout">
              {filteredKots.map(kot => (
                <KotCard 
                  key={kot.id} 
                  kot={kot} 
                  onStatusChange={handleStatusChange} 
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function StatBadge({ icon, label, count, color }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">{label}</span>
        <span className="text-lg font-bold leading-none">{count}</span>
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
        active 
          ? "bg-primary text-white border-primary" 
          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

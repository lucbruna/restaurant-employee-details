"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, ChefHat, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { apiClient } from "@/lib/api-client";

type KotStatus = "pending" | "preparing" | "ready" | "served" | "cancelled";

type KotTicket = {
  id: string;
  orderId: string;
  kotNumber: string;
  status: KotStatus;
  createdAt: string;
  orderType?: string | null;
  table?: { name?: string | null } | null;
  items: Array<{
    id?: string;
    quantity: number;
    name?: string;
    itemName?: string;
    notes?: string | null;
    itemNote?: string | null;
  }>;
};

export default function KotPage() {
  const [kots, setKots] = useState<KotTicket[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "preparing" | "ready">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const loadKots = async () => {
      try {
        const response = await apiClient.get<KotTicket[]>("/kitchen/kots");
        setKots(response.data);
      } catch (error) {
        console.error("[KOT_PAGE_LOAD]", error);
        toast.error("Failed to load kitchen tickets");
      } finally {
        setIsLoading(false);
      }
    };

    void loadKots();
  }, []);

  const filteredKots = useMemo(() => {
    return kots.filter((kot) => {
      const matchesFilter = filter === "all" || kot.status === filter;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        kot.kotNumber.toLowerCase().includes(query) ||
        kot.items.some((item) =>
          (item.name ?? item.itemName ?? "").toLowerCase().includes(query),
        );

      return matchesFilter && matchesSearch;
    });
  }, [filter, kots, searchQuery]);

  const updateKotStatus = async (id: string, newStatus: KotStatus) => {
    try {
      setUpdatingId(id);
      const response = await apiClient.patch<KotTicket>(`/kitchen/kots/${id}`, {
        status: newStatus,
      });

      setKots((prev) =>
        prev.map((kot) => (kot.id === id ? { ...kot, ...response.data } : kot)),
      );
      toast.success(`KOT ${response.data.kotNumber} updated to ${newStatus}`);
    } catch (error) {
      console.error("[KOT_STATUS_UPDATE]", error);
      toast.error("Failed to update KOT status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="app-canvas flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
        <section className="app-panel relative overflow-hidden rounded-[var(--radius-xxl)] p-6 sm:p-8">
          <div className="app-hero-glow absolute inset-0" />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                  <ChefHat className="h-3.5 w-3.5" />
                  Bhukkad Kitchen Rail
                </div>
                <div>
                  <h1 className="brand-display text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                  Kitchen Display System
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-text-secondary sm:text-base">
                    Manage active orders and kitchen tickets with the same crisp contrast and
                    calmer readability that makes the POS header hold up against rich backgrounds.
                  </p>
                </div>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  placeholder="Search KOTs..."
                  className="pl-9 border-border/70 bg-background/90 shadow-[var(--shadow-elevation-1)]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="app-panel-subtle scrollbar-hide flex items-center gap-2 overflow-x-auto rounded-[var(--radius-xl)] p-3">
              <StatusTab
                label="All Tickets"
                count={kots.length}
                active={filter === "all"}
                onClick={() => setFilter("all")}
              />
              <StatusTab
                label="Pending"
                count={kots.filter((k) => k.status === "pending").length}
                active={filter === "pending"}
                onClick={() => setFilter("pending")}
                color="bg-warning"
              />
              <StatusTab
                label="Preparing"
                count={kots.filter((k) => k.status === "preparing").length}
                active={filter === "preparing"}
                onClick={() => setFilter("preparing")}
                color="bg-primary"
              />
              <StatusTab
                label="Ready"
                count={kots.filter((k) => k.status === "ready").length}
                active={filter === "ready"}
                onClick={() => setFilter("ready")}
                color="bg-success"
              />
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filteredKots.map((kot) => (
                <motion.div
                  key={kot.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex"
                >
                  <Card className="flex w-full flex-col overflow-hidden border-border/70 bg-card/95 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-elevation-2)]">
                    <div
                      className={`h-1.5 w-full ${
                        kot.status === "pending"
                          ? "bg-warning"
                          : kot.status === "preparing"
                            ? "bg-primary"
                            : kot.status === "ready"
                              ? "bg-success"
                              : "bg-border"
                      }`}
                    />

                    <CardHeader className="border-b border-border/70 bg-surface-container-high/80 p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black uppercase tracking-widest text-text-muted">
                          {kot.kotNumber}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 ${
                            kot.status === "pending"
                              ? "text-warning border-warning/20 bg-warning/5"
                              : kot.status === "preparing"
                                ? "text-primary border-primary/20 bg-primary/5"
                                : kot.status === "ready"
                                  ? "text-success border-success/20 bg-success/5"
                              : "border-border bg-muted text-text-secondary"
                          }`}
                        >
                          {kot.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-text-secondary">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDistanceToNow(new Date(kot.createdAt))} ago
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider">
                          {kot.table?.name || "Takeaway"}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 bg-card p-4">
                      <div className="space-y-3">
                        {kot.items.map((item, index) => {
                          const itemName = item.name ?? item.itemName ?? "Unnamed item";
                          const itemNote = item.notes ?? item.itemNote;

                          return (
                            <div key={item.id ?? `${kot.id}-${index}`} className="flex items-start justify-between group">
                              <div className="flex gap-3">
                                <span className="font-black text-primary text-sm">{item.quantity}x</span>
                                <div>
                                  <p className="text-sm font-bold leading-tight text-text-primary">{itemName}</p>
                                  {itemNote && (
                                    <p className="mt-0.5 text-[10px] font-bold uppercase text-error">
                                      Note: {itemNote}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>

                    <div className="flex gap-2 border-t border-border/70 bg-surface-container/90 p-4">
                      {kot.status === "pending" && (
                        <Button
                          className="flex-1 font-bold text-xs h-9"
                          onClick={() => void updateKotStatus(kot.id, "preparing")}
                          disabled={updatingId === kot.id}
                        >
                          {updatingId === kot.id ? (
                            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                          ) : (
                            <ChefHat className="w-3.5 h-3.5 mr-2" />
                          )}
                          Prepare
                        </Button>
                      )}
                      {kot.status === "preparing" && (
                        <Button
                          className="flex-1 font-bold text-xs h-9 bg-success hover:bg-success/90"
                          onClick={() => void updateKotStatus(kot.id, "ready")}
                          disabled={updatingId === kot.id}
                        >
                          {updatingId === kot.id ? (
                            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                          )}
                          Ready
                        </Button>
                      )}
                      {kot.status === "ready" && (
                        <Button
                          variant="outline"
                          className="flex-1 font-bold text-xs h-9"
                          onClick={() => void updateKotStatus(kot.id, "served")}
                          disabled={updatingId === kot.id}
                        >
                          {updatingId === kot.id ? (
                            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                          ) : null}
                          Served
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filteredKots.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-20 text-text-secondary">
            <ChefHat className="w-20 h-20 mb-4 opacity-20" />
            <p className="font-black text-xl uppercase tracking-widest opacity-40">No Active Tickets</p>
            <p className="text-sm">Kitchen is all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusTab({ label, count, active, onClick, color = "bg-border" }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 transition-all ${
        active
          ? "border-primary/20 bg-card text-text-primary shadow-[var(--shadow-elevation-1)]"
          : "border-transparent bg-surface-container text-text-secondary hover:border-border/70 hover:bg-card"
      }`}
    >
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs font-bold">{label}</span>
      <Badge variant="secondary" className="h-5 bg-muted px-1.5 text-[10px] font-black text-text-secondary">
        {count}
      </Badge>
    </button>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Clock, Receipt, Search, Table2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatePanel } from "@/components/ui/state-panel";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import type { Order } from "@/types";

type OrderHistoryItem = Order & {
  paymentStatus: "paid" | "unpaid";
  customerName?: string | null;
  customerPhone?: string | null;
  table?: { name?: string | null } | null;
};

type FilterValue = "all" | "paid" | "active";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterValue>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function loadOrders() {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await apiClient.get<OrderHistoryItem[]>("/orders/history");
      setOrders(response.data);
    } catch (error) {
      const message = getApiErrorMessage(error, "We could not load the latest order ledger.");
      console.error("[ORDERS_PAGE_LOAD]", error);
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const statusSummary = useMemo(() => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter((order) => order.status === "paid");
    const activeOrders = orders.filter((order) => order.status === "active");
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const settledRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      totalOrders,
      paidOrders: paidOrders.length,
      activeOrders: activeOrders.length,
      totalRevenue,
      settledRevenue,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        order.orderNumber.toLowerCase().includes(query) ||
        order.orderType.toLowerCase().includes(query) ||
        (order.customerName ?? "").toLowerCase().includes(query) ||
        (order.table?.name ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && order.status === "paid") ||
        (statusFilter === "active" && order.status === "active");

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  return (
    <div className="flex-1 overflow-y-auto app-canvas">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
        <section className="app-panel relative overflow-hidden rounded-[var(--radius-xxl)] p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,107,53,0.16),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(72,187,120,0.14),_transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,249,245,0.96))]" />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                  <Receipt className="h-3.5 w-3.5" />
                  Bhukkad Service Ledger
                </div>
                <div className="space-y-2">
                  <h1 className="brand-display text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                    Order history with live revenue clarity
                  </h1>
                  <p className="max-w-3xl text-sm leading-7 text-text-secondary sm:text-base">
                    Review settled checks, active tables, and service momentum from one polished
                    command view built for floor managers and investor walkthroughs alike.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryTile label="Orders" value={statusSummary.totalOrders.toString()} />
                <SummaryTile label="Settled" value={statusSummary.paidOrders.toString()} />
                <SummaryTile label="Active Checks" value={statusSummary.activeOrders.toString()} />
                <SummaryTile
                  label="Settled Revenue"
                  value={formatCurrency(statusSummary.settledRevenue)}
                />
              </div>
            </div>

            <div className="app-panel-subtle flex flex-col gap-3 rounded-[var(--radius-xl)] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  placeholder="Search order, table, order type, or customer..."
                  className="h-12 rounded-[var(--radius-large)] border-border/70 bg-background pl-11 text-sm font-medium"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <FilterChip
                  label="All"
                  active={statusFilter === "all"}
                  count={statusSummary.totalOrders}
                  onClick={() => setStatusFilter("all")}
                />
                <FilterChip
                  label="Paid"
                  active={statusFilter === "paid"}
                  count={statusSummary.paidOrders}
                  onClick={() => setStatusFilter("paid")}
                />
                <FilterChip
                  label="Active"
                  active={statusFilter === "active"}
                  count={statusSummary.activeOrders}
                  onClick={() => setStatusFilter("active")}
                />
              </div>
            </div>
          </div>
        </section>

        {loadError && orders.length === 0 ? (
          <StatePanel
            eyebrow="Orders bootstrap interrupted"
            title="The order ledger did not come online"
            description={`${loadError} You can retry safely without leaving the dashboard.`}
            tone="error"
            primaryAction={{ label: "Retry order sync", onClick: () => void loadOrders() }}
            secondaryAction={{ label: "Go to dashboard", href: "/dashboard", variant: "outline" }}
          />
        ) : null}

        {isLoading ? (
          <OrdersLoadingState />
        ) : !loadError || orders.length > 0 ? (
          <>
            {filteredOrders.length > 0 ? (
              <section className="grid gap-4">
                {filteredOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="overflow-hidden border-border/70 bg-card/95 shadow-[var(--shadow-elevation-1)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevation-2)]"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:gap-6 md:p-6">
                        <div
                          className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-[var(--radius-large)] border shadow-[var(--shadow-elevation-1)]",
                            order.status === "paid"
                              ? "border-success/20 bg-success/10 text-success"
                              : order.status === "active"
                                ? "border-primary/20 bg-primary/10 text-primary"
                                : "border-border/70 bg-muted/70 text-text-muted"
                          )}
                        >
                          <Receipt className="h-6 w-6" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                              {order.orderNumber}
                            </h2>
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]",
                                order.status === "paid"
                                  ? "border-success/20 bg-success/10 text-success"
                                  : order.status === "active"
                                    ? "border-primary/20 bg-primary/10 text-primary"
                                    : "border-border bg-muted text-text-secondary"
                              )}
                            >
                              {order.status}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]"
                            >
                              {order.orderType.replace("_", " ")}
                            </Badge>
                            {order.paymentStatus === "paid" ? (
                              <Badge className="rounded-full bg-success text-success-foreground">
                                Payment settled
                              </Badge>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
                            <MetaChip
                              icon={<Clock className="h-4 w-4" />}
                              label={format(new Date(order.createdAt), "dd MMM · hh:mm a")}
                            />
                            <MetaChip
                              icon={<User className="h-4 w-4" />}
                              label={order.customerName || "Walk-in guest"}
                            />
                            <MetaChip
                              icon={<Table2 className="h-4 w-4" />}
                              label={order.table?.name || "No table assigned"}
                            />
                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                              {order.items.length} items
                            </span>
                          </div>
                        </div>

                        <div className="flex min-w-[180px] flex-col items-start gap-2 rounded-[var(--radius-large)] border border-border/70 bg-muted/40 px-4 py-3 text-left md:items-end md:text-right">
                          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-text-muted">
                            Order total
                          </p>
                          <p className="text-2xl font-semibold tracking-tight text-text-primary">
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <p className="text-xs font-semibold text-text-secondary">
                            {order.paymentStatus === "paid"
                              ? "Captured and settled"
                              : "Awaiting settlement"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </section>
            ) : (
              <StatePanel
                eyebrow="No matching checks"
                title="Nothing matches the current filter set"
                description="Adjust the search term or switch the ledger segment to bring more service activity into view."
                tone="empty"
                primaryAction={{
                  label: "Reset filters",
                  onClick: () => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  },
                }}
              />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-large)] border border-border/70 bg-card/88 px-4 py-3 shadow-[var(--shadow-elevation-1)] backdrop-blur">
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
    </div>
  );
}

function MetaChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition",
        active
          ? "border-primary/20 bg-primary text-primary-foreground shadow-[var(--shadow-elevation-1)]"
          : "border-border/70 bg-background text-text-secondary hover:border-primary/20 hover:bg-primary/6 hover:text-primary"
      )}
    >
      {label} · {count}
    </button>
  );
}

function OrdersLoadingState() {
  return (
    <section className="grid gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="overflow-hidden border-border/70 bg-card/92">
          <CardContent className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:gap-6 md:p-6">
            <Skeleton className="h-14 w-14 rounded-[var(--radius-large)]" />

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-40 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-28 rounded-full" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-40 rounded-full" />
                <Skeleton className="h-8 w-44 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>
            </div>

            <div className="space-y-2 rounded-[var(--radius-large)] border border-border/70 bg-muted/40 px-4 py-3">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

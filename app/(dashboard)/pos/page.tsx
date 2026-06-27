"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  LayoutGrid,
  Loader2,
  QrCode,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  UserPlus,
  Utensils,
  X,
} from "lucide-react";
import { AIChatbot } from "@/components/pos/ai-chatbot";
import { CustomerModal } from "@/components/pos/customer-modal";
import { ItemGrid } from "@/components/pos/item-grid";
import { OrderCart } from "@/components/pos/order-cart";
import { TableFloorPlan } from "@/components/pos/table-floor-plan";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { StatePanel } from "@/components/ui/state-panel";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { getTabletOrderingHref } from "@/lib/tablet-ordering";
import { cn } from "@/lib/utils";
import { usePosStore } from "@/hooks/use-pos-store";
import type { Category, MenuItem, Table } from "@/types";

export default function POSPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const { selectedTableId, selectedCustomer, orderType, setCustomer, setOrderType } =
    usePosStore();

  async function loadData() {
    setIsRefreshing(true);
    setLoadError(null);

    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const outletId = session?.user?.outletId;

      if (outletId) {
        const { getSocket } = await import("@/lib/socket");
        const socket = getSocket();
        socket.emit("pos:join", { outletId });

        socket.off("table:updated");
        socket.on("table:updated", ({ tableId, status, currentOrderId }) => {
          setTables((prev) =>
            prev.map((table) =>
              table.id === tableId ? { ...table, status, currentOrderId } : table
            )
          );
        });
      }

      const [catsRes, itemsRes, tablesRes] = await Promise.all([
        apiClient.get("/menu/categories"),
        apiClient.get("/menu/items"),
        apiClient.get("/tables"),
      ]);

      setCategories(catsRes.data);
      setItems(itemsRes.data);
      setTables(tablesRes.data.tables);
      setSections(tablesRes.data.sections);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "The POS workspace could not load its live menu and table data."
      );
      console.error("[POS_LOAD_DATA]", error);
      setLoadError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadData();

    return () => {
      import("@/lib/socket").then(({ getSocket }) => {
        const socket = getSocket();
        socket.off("table:updated");
      });
    };
  }, []);

  if (isLoading) {
    return (
      <div className="app-canvas flex flex-1 items-center justify-center">
        <div className="app-panel-subtle flex items-center gap-3 rounded-[var(--radius-xl)] px-5 py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-semibold text-text-primary">
            Preparing the service console
          </span>
        </div>
      </div>
    );
  }

  if (loadError && items.length === 0) {
    return (
      <div className="app-canvas flex flex-1 items-center justify-center p-6">
        <StatePanel
          eyebrow="POS bootstrap interrupted"
          title="The service console did not come online"
          description={`${loadError} Retry the sync to bring back tables, menus, and ordering controls.`}
          tone="error"
          primaryAction={{ label: "Retry POS sync", onClick: () => void loadData() }}
          secondaryAction={{ label: "Return to dashboard", href: "/dashboard", variant: "outline" }}
          className="w-full max-w-3xl"
        />
      </div>
    );
  }

  return (
    <div className="app-canvas flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <section className="app-panel relative overflow-hidden rounded-[var(--radius-xxl)] p-4 sm:p-5">
          <div className="app-hero-glow absolute inset-0" />
          <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                <Utensils className="h-3.5 w-3.5" />
                Bhukkad Service Console
              </div>
              <div>
                <h1 className="brand-display text-3xl font-semibold tracking-tight text-text-primary">
                  Faster service, cleaner table control
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-text-secondary">
                  Move between dine-in, takeaway, and delivery with one resilient workspace built
                  for floor speed and polished demo moments.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusPill label="Live sync" intent="success" pulsing />
              <StatusPill
                label={
                  selectedTableId
                    ? `Table ${selectedTableId.replace("t", "")} selected`
                    : "No table selected"
                }
                intent={selectedTableId ? "default" : "muted"}
              />
              <StatusPill
                label={selectedCustomer ? selectedCustomer.name : "Walk-in flow"}
                intent={selectedCustomer ? "default" : "muted"}
              />
            </div>
          </div>

          <div className="relative mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-[var(--radius-large)] border border-border/70 bg-background/90 p-1 shadow-[var(--shadow-elevation-1)]">
                <OrderTypeTab
                  active={orderType === "dine_in"}
                  onClick={() => setOrderType("dine_in")}
                  label="Dine in"
                  icon={<Utensils className="h-4 w-4" />}
                />
                <OrderTypeTab
                  active={orderType === "takeaway"}
                  onClick={() => setOrderType("takeaway")}
                  label="Takeaway"
                  icon={<ShoppingBag className="h-4 w-4" />}
                />
                <OrderTypeTab
                  active={orderType === "delivery"}
                  onClick={() => setOrderType("delivery")}
                  label="Delivery"
                  icon={<Truck className="h-4 w-4" />}
                />
              </div>

              {orderType === "dine_in" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-10 rounded-[var(--radius-large)] border-primary/20 bg-background/90 font-semibold shadow-[var(--shadow-elevation-1)]",
                      selectedTableId &&
                        "border-transparent bg-primary text-primary-foreground hover:bg-primary-dark"
                    )}
                    onClick={() => setShowFloorPlan(true)}
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    {selectedTableId
                      ? `Table ${selectedTableId.replace("t", "")}`
                      : "Select table"}
                  </Button>

                  {selectedTableId ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 rounded-[var(--radius-large)] bg-background/90 font-semibold shadow-[var(--shadow-elevation-1)]"
                      onClick={() =>
                        window.open(
                          getTabletOrderingHref(selectedTableId),
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      Open guest view
                    </Button>
                  ) : null}
                </>
              ) : null}

              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-10 rounded-[var(--radius-large)] bg-background/90 font-semibold shadow-[var(--shadow-elevation-1)]",
                  selectedCustomer &&
                    "border-success/20 bg-success/10 text-success hover:bg-success/15"
                )}
                onClick={() => setShowCustomerModal(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {selectedCustomer ? selectedCustomer.name : "Attach customer"}
              </Button>
            </div>

            <div className="flex items-center gap-2 self-start xl:self-auto">
              {loadError ? (
                <div className="rounded-full border border-error/20 bg-error/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-error">
                  Sync degraded
                </div>
              ) : null}
              <AIChatbot inline compact />
              <QuickActionButton
                onClick={() => void loadData()}
                disabled={isRefreshing}
                icon={<RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />}
                label="Refresh service data"
              />
              <QuickActionButton
                icon={<Search className="h-4 w-4" />}
                label="Search coming soon"
                disabled
              />
              <QuickActionButton
                icon={<Bell className="h-4 w-4" />}
                label="Alerts coming soon"
                disabled
              />
            </div>
          </div>
        </section>

        {loadError && items.length > 0 ? (
          <div className="rounded-[var(--radius-large)] border border-error/20 bg-error/8 px-4 py-3 text-sm text-error shadow-[var(--shadow-elevation-1)]">
            {loadError} Existing menu data is still available, and you can retry the sync at any
            time.
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 gap-4">
          <div className="app-panel hidden w-28 flex-shrink-0 overflow-hidden rounded-[var(--radius-xxl)] border lg:flex xl:w-32">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-surface/95">
              <CategoryRailItem
                label="All"
                emoji="🍽️"
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
              />
              {categories.map((category) => (
                <CategoryRailItem
                  key={category.id}
                  label={category.name}
                  emoji={category.emoji ?? "🍽️"}
                  active={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                />
              ))}
            </div>
          </div>

          <div className="app-panel min-w-0 flex-1 overflow-hidden rounded-[var(--radius-xxl)]">
            <ItemGrid categories={categories} items={items} activeCategoryId={activeCategory} />
          </div>

          <div className="app-panel hidden w-[360px] flex-shrink-0 overflow-hidden rounded-[var(--radius-xxl)] xl:flex 2xl:w-[400px]">
            <OrderCart />
          </div>
        </div>

        <div className="app-panel overflow-hidden rounded-[var(--radius-xxl)] xl:hidden">
          <OrderCart />
        </div>
      </div>

      <Dialog open={showFloorPlan} onOpenChange={setShowFloorPlan}>
        <DialogContent className="max-w-4xl overflow-hidden rounded-[var(--radius-xxl)] border-border/70 p-0">
          <div className="flex items-center justify-between border-b border-border/70 px-6 py-5">
            <div>
              <DialogTitle className="text-2xl font-semibold tracking-tight text-text-primary">
                Table management
              </DialogTitle>
              <p className="mt-1 text-sm text-text-secondary">
                Select a table to start or continue service.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowFloorPlan(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="h-[80vh] overflow-hidden">
            <TableFloorPlan
              tables={tables}
              sections={sections}
              onSelect={() => setShowFloorPlan(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSelect={setCustomer}
      />
    </div>
  );
}

function OrderTypeTab({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-[var(--radius-medium)] px-4 py-2 text-sm font-semibold transition",
        active
          ? "bg-primary text-primary-foreground shadow-[var(--shadow-elevation-1)]"
          : "text-text-secondary hover:bg-muted hover:text-text-primary"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StatusPill({
  label,
  intent,
  pulsing = false,
}: {
  label: string;
  intent: "success" | "default" | "muted";
  pulsing?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] shadow-[var(--shadow-elevation-1)]",
        intent === "success" && "bg-success/10 text-success",
        intent === "default" && "bg-primary/10 text-primary",
        intent === "muted" && "bg-background/90 text-text-secondary"
      )}
    >
      <div
        className={cn(
          "h-1.5 w-1.5 rounded-full bg-current",
          pulsing && "animate-pulse"
        )}
      />
      {label}
    </div>
  );
}

function QuickActionButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-[var(--radius-medium)] bg-background/80 text-text-secondary shadow-[var(--shadow-elevation-1)] hover:bg-muted"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {icon}
    </Button>
  );
}

function CategoryRailItem({
  label,
  emoji,
  active,
  onClick,
}: {
  label: string;
  emoji: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 border-b border-border/50 px-3 py-4 text-center transition",
        active
          ? "bg-primary/8 text-primary shadow-[inset_4px_0_0_var(--color-primary)]"
          : "text-text-secondary hover:bg-muted/60"
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-large)] bg-muted text-2xl">
        {emoji}
      </div>
      <span className="line-clamp-2 text-[11px] font-black uppercase tracking-[0.18em]">
        {label}
      </span>
    </button>
  );
}

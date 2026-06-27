"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Category, MenuItem } from "@/types";
import { usePosStore } from "@/hooks/use-pos-store";
import { ModifierSheet } from "./modifier-sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { itemEntry } from "@/lib/utils/motion";
import { formatCurrency } from "@/lib/utils/currency";
import { StatePanel } from "@/components/ui/state-panel";
import Fuse from "fuse.js";

interface ItemGridProps {
  categories: Category[];
  items: MenuItem[];
  activeCategoryId: string;
}

export function ItemGrid({ categories, items, activeCategoryId }: ItemGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("all"); // all, veg, non_veg, bestseller
  const [selectedItemForModifiers, setSelectedItemForModifiers] = useState<MenuItem | null>(null);
  const { addToCart, cart, updateQuantity } = usePosStore();
  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const fuse = useMemo(() => new Fuse(items, {
    keys: ['name', 'shortCode', 'tags'],
    threshold: 0.3,
  }), [items]);

  const filteredItems = useMemo(() => {
    let result = items;

    if (searchQuery) {
      result = fuse.search(searchQuery).map(res => res.item);
    } else if (activeCategoryId !== "all") {
      result = result.filter(item => item.categoryId === activeCategoryId);
    }

    if (filter === "veg") result = result.filter(i => i.foodType === "veg");
    if (filter === "non_veg") result = result.filter(i => i.foodType === "non_veg");
    if (filter === "bestseller") result = result.filter(i => i.isBestseller);
    if (filter === "quick") result = result.filter(i => (i.prepTimeMinutes ?? Infinity) <= 15);

    return result;
  }, [items, searchQuery, activeCategoryId, filter, fuse]);

  const handleItemClick = (item: MenuItem) => {
    if (item.modifierGroups && item.modifierGroups.length > 0) {
      setSelectedItemForModifiers(item);
    } else {
      addToCart(item);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="z-10 border-b border-border/70 bg-surface/95 p-4 shadow-sm">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search items, codes, tags... (Press / to focus)" 
            className="h-12 rounded-[var(--radius-large)] border-border/60 bg-background pl-10 text-lg shadow-[var(--shadow-elevation-1)] focus-visible:bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
          <FilterChip label="🟢 Veg" active={filter === "veg"} onClick={() => setFilter("veg")} />
          <FilterChip label="🔴 Non-Veg" active={filter === "non_veg"} onClick={() => setFilter("non_veg")} />
          <FilterChip label="⭐ Bestseller" active={filter === "bestseller"} onClick={() => setFilter("bestseller")} />
          <FilterChip label="⚡ Quick" active={filter === "quick"} onClick={() => setFilter("quick")} icon={<Zap className="w-3 h-3 mr-1" />} />
        </div>
      </div>

      {/* Grid */}
      <ScrollArea className="flex-1 p-4">
        {filteredItems.length === 0 ? (
          <StatePanel
            tone="empty"
            eyebrow="Bhukkad Menu Search"
            title="No dishes match this search yet"
            description="Try a broader search, switch filters, or jump back to all categories to keep service moving."
            className="min-h-[320px] justify-center"
            primaryAction={{
              label: "Clear Search",
              onClick: () => {
                setSearchQuery("");
                setFilter("all");
              },
            }}
          />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 pb-20">
            <AnimatePresence mode="popLayout">
              {filteredItems.map(item => {
                const cartItem = cart.find(i => i.itemId === item.id);
                const category = categoryMap.get(item.categoryId);
                
                return (
                  <motion.div
                    key={item.id}
                    layout
                    {...itemEntry}
                    className="group flex cursor-pointer flex-col overflow-hidden rounded-[var(--radius-xxl)] border border-border bg-card/95 shadow-[var(--shadow-elevation-1)] transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-elevation-2)]"
                    onClick={() => !cartItem && handleItemClick(item)}
                  >
                    <div className="flex flex-1 flex-col gap-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="rounded-md bg-card/95 p-1 shadow-sm">
                              <div className={`h-3 w-3 rounded-full ${item.foodType === 'veg' ? 'bg-success' : item.foodType === 'non_veg' ? 'bg-error' : 'bg-warning'}`} />
                            </div>
                            {item.isBestseller ? (
                              <div className="rounded-full bg-warning px-2 py-1 text-[10px] font-bold text-secondary-foreground shadow-sm">
                                BESTSELLER
                              </div>
                            ) : null}
                            {item.prepTimeMinutes ? (
                              <div className="rounded-full border border-border/70 bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                                {item.prepTimeMinutes} min
                              </div>
                            ) : null}
                          </div>
                          <h3 className="line-clamp-2 text-sm font-bold leading-tight transition-colors group-hover:text-primary">
                            {item.name}
                          </h3>
                          <p className="line-clamp-1 text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                            {item.shortCode || category?.name || "Menu Item"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto flex items-end justify-between">
                        <span className="font-bold text-primary">{formatCurrency(item.basePrice)}</span>
                        
                        {cartItem ? (
                          <div className="flex items-center overflow-hidden rounded-full bg-primary text-primary-foreground shadow-sm" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-primary-dark"
                              onClick={() => updateQuantity(cartItem.id, Math.max(0, cartItem.quantity - 1))}
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-sm font-bold">{cartItem.quantity}</span>
                            <button 
                              className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-primary-dark"
                              onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
                            <PlusIcon />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      <ModifierSheet 
        key={selectedItemForModifiers?.id}
        isOpen={!!selectedItemForModifiers}
        onClose={() => setSelectedItemForModifiers(null)}
        item={selectedItemForModifiers}
      />
    </div>
  );
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
}

function FilterChip({ label, active, onClick, icon }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? "border-secondary bg-secondary text-secondary-foreground shadow-[var(--shadow-elevation-1)]" : "border-border bg-background text-text-secondary hover:bg-muted"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/currency";
import { MenuItem } from "@/types";
import { usePosStore } from "@/hooks/use-pos-store";

interface ModifierSheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
}

function buildDefaultSelections(item: MenuItem | null) {
  if (!item) return {};

  const defaults: Record<string, string[]> = {};
  item.modifierGroups?.forEach(group => {
    const defaultMods = group.modifiers.filter(modifier => modifier.isDefault).map(modifier => modifier.id);
    if (defaultMods.length > 0) {
      defaults[group.id] = defaultMods;
    }
  });

  return defaults;
}

function isMultipleSelectionGroup(group: NonNullable<MenuItem["modifierGroups"]>[number]) {
  if (typeof group.isMultiple === "boolean") return group.isMultiple;
  return group.selectionType === "multiple";
}

export function ModifierSheet({ isOpen, onClose, item }: ModifierSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && item ? (
        <ModifierSheetContent key={item.id} item={item} onClose={onClose} />
      ) : null}
    </AnimatePresence>
  );
}

function ModifierSheetContent({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const { addToCart } = usePosStore();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>(() => buildDefaultSelections(item));

  const handleModifierToggle = (groupId: string, modifierId: string, isMultiple: boolean, maxSelections?: number) => {
    setSelectedModifiers(prev => {
      const currentGroupSelections = prev[groupId] || [];
      const isSelected = currentGroupSelections.includes(modifierId);

      if (isSelected) {
        return {
          ...prev,
          [groupId]: currentGroupSelections.filter(id => id !== modifierId),
        };
      }

      if (!isMultiple) {
        return {
          ...prev,
          [groupId]: [modifierId],
        };
      }

      if (maxSelections && currentGroupSelections.length >= maxSelections) {
        return prev;
      }

      return {
        ...prev,
        [groupId]: [...currentGroupSelections, modifierId],
      };
    });
  };

  const calculateTotal = () => {
    let total = item.basePrice;

    Object.entries(selectedModifiers).forEach(([groupId, modIds]) => {
      const group = item.modifierGroups?.find(g => g.id === groupId);
      if (!group) return;

      modIds.forEach(modId => {
        const mod = group.modifiers.find(m => m.id === modId);
        if (mod) total += mod.priceDelta;
      });
    });

    return total * quantity;
  };

  const isSelectionValid = () => {
    if (!item.modifierGroups) return true;

    for (const group of item.modifierGroups) {
      const selectedCount = (selectedModifiers[group.id] || []).length;
      if (group.isRequired && selectedCount < (group.minSelections || 1)) {
        return false;
      }
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!isSelectionValid()) return;

    const cartModifiers = [];
    for (const [groupId, modIds] of Object.entries(selectedModifiers)) {
      const group = item.modifierGroups?.find(g => g.id === groupId);
      if (!group) continue;

      for (const modId of modIds) {
        const mod = group.modifiers.find(m => m.id === modId);
        if (!mod) continue;

        cartModifiers.push({
          id: mod.id,
          name: mod.name,
          modifierId: mod.id,
          modifierName: mod.name,
          priceDelta: mod.priceDelta,
          groupId: group.id,
        });
      }
    }

    addToCart(item, quantity, cartModifiers, notes);
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-border bg-surface p-6">
          <div>
            <h2 className="text-2xl font-bold">{item.name}</h2>
            <p className="mt-1 text-muted-foreground">{formatCurrency(item.basePrice)}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted-foreground/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto p-6">
          {item.modifierGroups?.map(group => {
            const selectedCount = (selectedModifiers[group.id] || []).length;
            const isRequired = group.isRequired;
            const isSatisfied = !isRequired || selectedCount >= (group.minSelections || 1);
            const isMultiple = isMultipleSelectionGroup(group);

            return (
              <div key={group.id} className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    {group.name}
                    {isRequired && !isSatisfied ? (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                        Required
                      </span>
                    ) : null}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {isMultiple ? `Choose up to ${group.maxSelections || "any"}` : "Choose 1"}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.modifiers.map(mod => {
                    const isSelected = (selectedModifiers[group.id] || []).includes(mod.id);
                    const isDisabled = Boolean(
                      !isSelected && isMultiple && group.maxSelections && selectedCount >= group.maxSelections
                    );

                    return (
                      <button
                        key={mod.id}
                        onClick={() => handleModifierToggle(group.id, mod.id, isMultiple, group.maxSelections)}
                        disabled={isDisabled}
                        className={[
                          "w-full rounded-xl border-2 p-4 text-left transition-all",
                          "flex items-center justify-between",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-surface hover:border-primary/30",
                          isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={[
                              "flex h-5 w-5 items-center justify-center border transition-colors",
                              isMultiple ? "rounded" : "rounded-full",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input bg-background",
                            ].join(" ")}
                          >
                            {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                          </div>
                          <span className={isSelected ? "font-medium text-foreground" : "font-medium text-muted-foreground"}>
                            {mod.name}
                          </span>
                        </div>
                        {mod.priceDelta !== 0 ? (
                          <span className="text-sm font-medium text-muted-foreground">
                            {mod.priceDelta > 0
                              ? `+${formatCurrency(mod.priceDelta)}`
                              : `-${formatCurrency(Math.abs(mod.priceDelta))}`}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Special Instructions</h3>
            <textarea
              value={notes}
              onChange={event => setNotes(event.target.value)}
              placeholder="e.g. No onions, extra spicy..."
              className="min-h-[100px] w-full resize-none rounded-xl border-2 border-border bg-surface p-4 transition-colors focus:border-primary/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-muted-foreground">Quantity</span>
            <div className="flex items-center gap-4 rounded-lg border border-border bg-background p-1">
              <button
                onClick={() => setQuantity(current => Math.max(1, current - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="w-8 text-center text-lg font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(current => current + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <Button size="lg" className="h-14 w-full text-lg font-bold" onClick={handleAddToCart} disabled={!isSelectionValid()}>
            Add to Order • {formatCurrency(calculateTotal())}
          </Button>
        </div>
      </motion.div>
    </>
  );
}

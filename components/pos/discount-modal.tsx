"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Percent, IndianRupee, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils/currency";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  onApply: (type: "percentage" | "fixed", value: number, reason: string) => void;
}

export function DiscountModal({ isOpen, onClose, subtotal, onApply }: DiscountModalProps) {
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const handleApply = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;
    
    if (type === "percentage" && numValue > 100) return;
    if (type === "fixed" && numValue > subtotal) return;

    onApply(type, numValue, reason);
    onClose();
    setValue("");
    setReason("");
  };

  const calculateDiscountAmount = () => {
    const numValue = parseFloat(value) || 0;
    if (type === "percentage") {
      return (subtotal * numValue) / 100;
    }
    return numValue;
  };

  const discountAmount = calculateDiscountAmount();
  const newTotal = Math.max(0, subtotal - discountAmount);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Apply Discount
              </h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Type Selection */}
              <div className="flex p-1 bg-muted rounded-lg">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                    type === "percentage" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setType("percentage")}
                >
                  <Percent className="w-4 h-4" /> Percentage
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                    type === "fixed" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setType("fixed")}
                >
                  <IndianRupee className="w-4 h-4" /> Fixed Amount
                </button>
              </div>

              {/* Value Input */}
              <div className="space-y-2">
                <Label htmlFor="discount-value">Discount Value</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {type === "percentage" ? <Percent className="w-5 h-5" /> : <IndianRupee className="w-5 h-5" />}
                  </div>
                  <Input
                    id="discount-value"
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="pl-10 h-12 text-lg font-medium"
                    placeholder={type === "percentage" ? "e.g. 10" : "e.g. 150"}
                    autoFocus
                  />
                </div>
              </div>

              {/* Reason Input */}
              <div className="space-y-2">
                <Label htmlFor="discount-reason">Reason (Optional)</Label>
                <Input
                  id="discount-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Staff Discount, Loyalty"
                />
              </div>

              {/* Quick Select Buttons */}
              {type === "percentage" && (
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((pct) => (
                    <Button
                      key={pct}
                      variant="outline"
                      className="flex-1"
                      onClick={() => setValue(pct.toString())}
                    >
                      {pct}%
                    </Button>
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-success font-medium">
                  <span>Discount Amount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
                <div className="pt-2 border-t border-primary/20 flex justify-between font-bold text-lg">
                  <span>New Subtotal</span>
                  <span>{formatCurrency(newTotal)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border bg-surface">
              <Button 
                className="w-full h-12 text-lg" 
                onClick={handleApply}
                disabled={!value || parseFloat(value) <= 0}
              >
                Apply Discount
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

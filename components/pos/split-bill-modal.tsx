"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Users, SplitSquareHorizontal, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils/currency";
import { usePosStore } from "@/hooks/use-pos-store";

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onComplete: (splits: { amount: number; method: string }[]) => void;
}

export function SplitBillModal({ isOpen, onClose, total, onComplete }: SplitBillModalProps) {
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [numPeople, setNumPeople] = useState(2);
  const [customAmounts, setCustomAmounts] = useState<number[]>([total / 2, total / 2]);

  const handleEqualSplitChange = (n: number) => {
    const count = Math.max(2, Math.min(10, n));
    setNumPeople(count);
    const amount = total / count;
    setCustomAmounts(Array(count).fill(amount));
  };

  const handleCustomAmountChange = (index: number, value: string) => {
    const newAmounts = [...customAmounts];
    newAmounts[index] = parseFloat(value) || 0;
    setCustomAmounts(newAmounts);
  };

  const addCustomSplit = () => {
    if (customAmounts.length >= 10) return;
    const currentTotal = customAmounts.reduce((a, b) => a + b, 0);
    const remaining = Math.max(0, total - currentTotal);
    setCustomAmounts([...customAmounts, remaining]);
  };

  const removeCustomSplit = (index: number) => {
    if (customAmounts.length <= 2) return;
    const newAmounts = customAmounts.filter((_, i) => i !== index);
    setCustomAmounts(newAmounts);
  };

  const currentTotal = customAmounts.reduce((a, b) => a + b, 0);
  const isBalanced = Math.abs(total - currentTotal) < 0.01;

  const handleComplete = () => {
    if (!isBalanced) return;
    const splits = customAmounts.map(amount => ({ amount, method: "pending" }));
    onComplete(splits);
    onClose();
  };

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
            className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <SplitSquareHorizontal className="w-5 h-5 text-primary" />
                Split Bill
              </h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Total Display */}
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Amount</p>
                <p className="text-4xl font-black text-primary">{formatCurrency(total)}</p>
              </div>

              {/* Split Type Selection */}
              <div className="flex p-1 bg-muted rounded-lg">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                    splitType === "equal" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => {
                    setSplitType("equal");
                    handleEqualSplitChange(numPeople);
                  }}
                >
                  <Users className="w-4 h-4" /> Split Equally
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                    splitType === "custom" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setSplitType("custom")}
                >
                  <SplitSquareHorizontal className="w-4 h-4" /> Custom Amounts
                </button>
              </div>

              {/* Equal Split Controls */}
              {splitType === "equal" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Number of People</Label>
                    <div className="flex items-center gap-4 bg-surface border border-border rounded-lg p-1">
                      <button 
                        onClick={() => handleEqualSplitChange(numPeople - 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-lg">{numPeople}</span>
                      <button 
                        onClick={() => handleEqualSplitChange(numPeople + 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: numPeople }).map((_, i) => (
                      <div key={i} className="p-4 bg-surface rounded-xl border border-border text-center">
                        <p className="text-xs text-muted-foreground mb-1">Person {i + 1}</p>
                        <p className="text-xl font-bold">{formatCurrency(total / numPeople)}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Custom Split Controls */}
              {splitType === "custom" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                  {customAmounts.map((amount, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {index + 1}
                      </div>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <Input
                          type="number"
                          value={amount || ""}
                          onChange={(e) => handleCustomAmountChange(index, e.target.value)}
                          className="pl-8 h-12 text-lg font-medium"
                        />
                      </div>
                      {customAmounts.length > 2 && (
                        <button 
                          onClick={() => removeCustomSplit(index)}
                          className="w-10 h-10 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {customAmounts.length < 10 && (
                    <Button variant="outline" className="w-full border-dashed" onClick={addCustomSplit}>
                      + Add Person
                    </Button>
                  )}

                  {/* Balance Indicator */}
                  <div className={`p-4 rounded-xl border ${isBalanced ? 'bg-success/10 border-success/20 text-success' : 'bg-warning/10 border-warning/20 text-warning'}`}>
                    <div className="flex justify-between items-center font-medium">
                      <span>Remaining to Split:</span>
                      <span>{formatCurrency(total - currentTotal)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-6 border-t border-border bg-surface">
              <Button 
                className="w-full h-12 text-lg" 
                onClick={handleComplete}
                disabled={!isBalanced}
              >
                {isBalanced ? (
                  <><CheckCircle2 className="w-5 h-5 mr-2" /> Confirm Split</>
                ) : (
                  "Amounts Must Equal Total"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

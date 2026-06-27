"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  CheckCircle2,
  Loader2,
  Receipt,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils/currency";
import { usePosStore } from "@/hooks/use-pos-store";
import { toast } from "sonner";

type PaymentMethod = "cash" | "card" | "upi" | "wallet";

export interface PaymentSubmission {
  paymentMethod: PaymentMethod;
  amountPaid: number;
  reference?: string;
  transactionId?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  onComplete: () => void;
  onProcessPayment: (payment: PaymentSubmission) => Promise<{ orderId?: string } | void>;
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const axiosError = error as {
      response?: {
        data?: {
          error?: string;
          message?: string;
        };
      };
      message?: string;
    };

    return (
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Payment could not be completed."
    );
  }

  return "Payment could not be completed.";
}

export function PaymentModal({
  isOpen,
  onClose,
  total,
  subtotal,
  tax,
  discount,
  onComplete,
  onProcessPayment,
}: PaymentModalProps) {
  const { cart, orderType, selectedCustomer, selectedTableId } = usePosStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash");
  const [amountTendered, setAmountTendered] = useState<string>(total.toString());
  const [reference, setReference] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [needsGst, setNeedsGst] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedMethod("cash");
    setAmountTendered(total.toString());
    setReference("");
    setTransactionId("");
    setNeedsGst(Boolean(selectedCustomer?.gstNumber));
    setGstNumber(selectedCustomer?.gstNumber ?? "");
    setIsProcessing(false);
    setIsSuccess(false);
    setErrorMessage(null);
    setCompletedOrderId(null);
  }, [isOpen, selectedCustomer, total]);

  const changeAmount = Math.max(0, parseFloat(amountTendered || "0") - total);
  const orderLabel = selectedTableId ? `Table ${selectedTableId.replace("t", "")}` : orderType.replace("_", " ");

  const handleComplete = async () => {
    const amountPaid = selectedMethod === "cash" ? Number(amountTendered || 0) : total;

    if (selectedMethod === "cash" && amountPaid < total) {
      setErrorMessage("Cash received is less than the bill total.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await onProcessPayment({
        paymentMethod: selectedMethod,
        amountPaid,
        reference: reference.trim() || undefined,
        transactionId: transactionId.trim() || undefined,
      });

      setCompletedOrderId(result?.orderId ?? null);
      setIsSuccess(true);

      confetti({
        particleCount: 140,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#FF6B35", "#48BB78", "#63B3ED", "#F6AD55"],
      });

      toast.success(`Payment recorded for ${formatCurrency(total)}.`);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={!isProcessing && !isSuccess ? onClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] max-h-[800px]"
          >
            {!isProcessing && !isSuccess && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {isSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                  className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center text-success mb-4"
                >
                  <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Payment Recorded</h2>
                  <p className="text-sm font-bold text-success uppercase tracking-widest">
                    Order settled successfully
                  </p>
                </div>
                <p className="text-xl text-muted-foreground">
                  Received {formatCurrency(total)} via {selectedMethod.toUpperCase()}
                </p>
                {completedOrderId ? (
                  <p className="text-sm text-muted-foreground">Order ID: {completedOrderId}</p>
                ) : null}

                <div className="flex gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    onClick={() => toast.success("Receipt is ready to print from the order history.")}
                  >
                    <Receipt className="w-5 h-5" /> Receipt
                  </Button>
                  <Button size="lg" onClick={onComplete}>
                    Back to POS
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-full md:w-2/5 bg-surface border-r border-border flex flex-col h-full">
                  <div className="p-6 border-b border-border bg-muted/30">
                    <h2 className="text-2xl font-bold tracking-tight mb-1">Bill Summary</h2>
                    <p className="text-sm text-muted-foreground capitalize">{orderLabel}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Items ({cart.length})
                      </h3>
                      <div className="space-y-2">
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm gap-4">
                            <span className="flex-1 truncate">
                              {item.quantity}x {item.itemName}
                            </span>
                            <span className="font-medium">{formatCurrency(item.itemTotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border border-dashed space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      {discount > 0 ? (
                        <div className="flex justify-between text-sm text-success font-medium">
                          <span>Discount</span>
                          <span>-{formatCurrency(discount)}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Taxes (GST 5%)</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-primary/5 border-t border-primary/20">
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-semibold text-primary-dark">Grand Total</span>
                      <span className="text-4xl font-black text-primary tracking-tight">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-3/5 flex flex-col h-full bg-background">
                  <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Customer</h3>
                      <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
                        <p className="font-semibold">
                          {selectedCustomer ? selectedCustomer.name : "Walk-in customer"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedCustomer?.phone || "No customer attached to this bill"}
                        </p>
                        {selectedCustomer?.email ? (
                          <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                        ) : null}
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id="gst"
                          checked={needsGst}
                          onCheckedChange={(checked) => setNeedsGst(Boolean(checked))}
                        />
                        <label
                          htmlFor="gst"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Requires GST Invoice
                        </label>
                      </div>

                      {needsGst ? (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
                          <Input
                            placeholder="Enter GSTIN..."
                            className="h-10 uppercase"
                            value={gstNumber}
                            onChange={(event) => setGstNumber(event.target.value)}
                          />
                        </motion.div>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Payment Method</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <MethodCard
                          icon={<Banknote className="w-6 h-6" />}
                          label="Cash"
                          shortcut="C"
                          selected={selectedMethod === "cash"}
                          onClick={() => setSelectedMethod("cash")}
                        />
                        <MethodCard
                          icon={<CreditCard className="w-6 h-6" />}
                          label="Card"
                          shortcut="D"
                          selected={selectedMethod === "card"}
                          onClick={() => setSelectedMethod("card")}
                        />
                        <MethodCard
                          icon={<Smartphone className="w-6 h-6" />}
                          label="UPI"
                          shortcut="U"
                          selected={selectedMethod === "upi"}
                          onClick={() => setSelectedMethod("upi")}
                        />
                        <MethodCard
                          icon={<Wallet className="w-6 h-6" />}
                          label="Wallet"
                          shortcut="W"
                          selected={selectedMethod === "wallet"}
                          onClick={() => setSelectedMethod("wallet")}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                      {selectedMethod === "cash" ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                          <div>
                            <Label htmlFor="tendered" className="text-sm text-muted-foreground mb-1 block">
                              Amount Tendered
                            </Label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-medium text-muted-foreground">
                                Rs.
                              </span>
                              <Input
                                id="tendered"
                                type="number"
                                value={amountTendered}
                                onChange={(event) => setAmountTendered(event.target.value)}
                                className="h-16 pl-14 text-3xl font-bold bg-surface"
                                autoFocus
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center p-4 rounded-xl bg-muted/50 border border-border">
                            <span className="text-lg font-medium">Change Due</span>
                            <span
                              className={`text-2xl font-bold ${
                                changeAmount > 0 ? "text-primary" : "text-muted-foreground"
                              }`}
                            >
                              {formatCurrency(changeAmount)}
                            </span>
                          </div>

                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {[500, 1000, 2000, 5000].map((amount) => (
                              <Button
                                key={amount}
                                variant="outline"
                                className="flex-shrink-0"
                                onClick={() => setAmountTendered(amount.toString())}
                              >
                                Rs. {amount}
                              </Button>
                            ))}
                            <Button variant="outline" onClick={() => setAmountTendered(total.toString())}>
                              Exact
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                          <div className="p-4 bg-info/10 text-info border border-info/20 rounded-xl text-sm flex items-center gap-3">
                            {selectedMethod === "card" ? (
                              <CreditCard className="w-5 h-5" />
                            ) : selectedMethod === "upi" ? (
                              <Smartphone className="w-5 h-5" />
                            ) : (
                              <Wallet className="w-5 h-5" />
                            )}
                            <p>
                              Record a {selectedMethod.toUpperCase()} payment for{" "}
                              <strong>{formatCurrency(total)}</strong>.
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Reference Number</Label>
                              <Input
                                placeholder="Reference"
                                value={reference}
                                onChange={(event) => setReference(event.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Transaction ID</Label>
                              <Input
                                placeholder="Transaction ID"
                                value={transactionId}
                                onChange={(event) => setTransactionId(event.target.value)}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {errorMessage ? (
                      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        {errorMessage}
                      </div>
                    ) : null}
                  </div>

                  <div className="p-6 md:p-8 border-t border-border bg-surface mt-auto">
                    <Button
                      size="lg"
                      className="w-full h-16 text-xl font-bold shadow-lg shadow-primary/20"
                      onClick={handleComplete}
                      disabled={isProcessing || (selectedMethod === "cash" && parseFloat(amountTendered || "0") < total)}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Processing...
                        </>
                      ) : (
                        `Complete Payment • ${formatCurrency(total)}`
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

type MethodCardProps = {
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  selected: boolean;
  onClick: () => void;
};

function MethodCard({ icon, label, shortcut, selected, onClick }: MethodCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
        selected
          ? "border-primary bg-primary/5 text-primary shadow-sm"
          : "border-border bg-surface text-muted-foreground hover:border-primary/30 hover:bg-surface"
      }`}
    >
      <div className="mb-2">{icon}</div>
      <span className="font-semibold">{label}</span>
      <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
        {shortcut}
      </span>
      {selected ? (
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      ) : null}
    </button>
  );
}

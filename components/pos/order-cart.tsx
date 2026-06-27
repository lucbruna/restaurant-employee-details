"use client";

import { usePosStore } from "@/hooks/use-pos-store";
import { formatCurrency } from "@/lib/utils/currency";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2, User, Utensils, Send, Receipt, Loader2, CreditCard, Plus, Minus, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { toast } from "sonner";
import { PaymentModal, PaymentSubmission } from "./payment-modal";

export function OrderCart() {
  const {
    cart,
    selectedCustomer,
    selectedTableId,
    orderType,
    paxCount,
    discountAmount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = usePosStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
  const tax = subtotal * 0.05; // 5% flat GST for demo
  const total = subtotal + tax - discountAmount;

  const handleAiSuggest = async () => {
    if (cart.length === 0) {
      toast.info("Add some items to get AI suggestions");
      return;
    }
    setIsAiLoading(true);
    try {
      const itemsList = cart.map(i => `${i.quantity}x ${i.itemName}`).join(", ");
      const prompt = `Based on these items in a restaurant order: ${itemsList}. Suggest 2-3 complementary items or drinks from a typical Indian/Global menu that would go well with this order. Keep it very brief and appetizing.`;
      const { data } = await apiClient.post("/ai", {
        type: "menu-intelligence",
        prompt,
      });
      setAiSuggestion(data?.response ?? null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to get AI suggestions right now."));
    } finally {
      setIsAiLoading(false);
    }
  };

  const createOrder = async () => {
    const response = await apiClient.post("/orders", {
      tableId: selectedTableId,
      customerId: selectedCustomer?.id ?? null,
      orderType,
      paxCount,
      items: cart,
      subtotal,
      taxAmount: tax,
      discountAmount,
      totalAmount: total,
    });

    return response.data as { id: string };
  };

  const handleSendKOT = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      await createOrder();
      toast.success("KOT sent to kitchen");
      clearCart();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to send the kitchen order ticket.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBill = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    let createdOrderId: string | null = null;

    try {
      const order = await createOrder();
      createdOrderId = order.id;

      await apiClient.post(`/orders/${order.id}/pay`, {
        paymentMethod: 'cash',
        amountPaid: total,
      });

      toast.success("Bill generated and paid");
      clearCart();
    } catch (error) {
      toast.error(
        createdOrderId
          ? "The order was created, but payment did not complete. You can settle it from active orders."
          : getApiErrorMessage(error, "Failed to generate the bill.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessPayment = async (payment: PaymentSubmission) => {
    let createdOrderId: string | null = null;

    try {
      const order = await createOrder();
      createdOrderId = order.id;

      await apiClient.post(`/orders/${order.id}/pay`, {
        paymentMethod: payment.paymentMethod,
        amountPaid: payment.amountPaid,
        reference: payment.reference,
        transactionId: payment.transactionId,
      });

      return { orderId: order.id };
    } catch (error) {
      throw new Error(
        createdOrderId
          ? "The order was created, but payment did not complete. Please review it in active orders before retrying."
          : getApiErrorMessage(error, "We couldn't complete the payment.")
      );
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border/70 bg-surface/95 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Current Order</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-extrabold text-xl">
                {selectedTableId ? `Table ${selectedTableId.replace('t', '')}` : 'Takeaway'}
              </span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold uppercase">
                {orderType.replace('_', ' ')}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs font-bold border-error/20 text-error hover:bg-error/5" onClick={clearCart}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-surface/80 p-2">
            <User className="w-4 h-4 text-text-muted" />
            <span className="text-xs font-bold">Guest ({paxCount})</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-surface/80 p-2">
            <Utensils className="w-4 h-4 text-text-muted" />
            <span className="text-xs font-bold truncate">
              {selectedCustomer ? selectedCustomer.name : "Walk-in Customer"}
            </span>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1 px-4 py-2">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[var(--radius-xxl)] bg-primary/10 text-primary shadow-[var(--shadow-elevation-1)]">
              <Receipt className="h-9 w-9" />
            </div>
            <p className="mt-5 text-lg font-black uppercase tracking-[0.24em] text-text-primary">Empty Bill</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-text-secondary">
              Add a few dishes to build the live bill, then send the KOT or settle payment from the same panel.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {/* AI Suggestion Banner */}
            <AnimatePresence>
              {aiSuggestion && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 relative group">
                    <button 
                      onClick={() => setAiSuggestion(null)}
                      className="absolute top-2 right-2 text-primary/40 hover:text-primary"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">AI Recommendation</p>
                        <p className="text-xs text-text-secondary leading-relaxed italic">{aiSuggestion}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="py-4 group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0 bg-primary/40" />
                        <h4 className="font-bold text-sm leading-tight">{item.itemName}</h4>
                      </div>
                      {item.modifiers?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 ml-4">
                          {item.modifiers.map(m => (
                            <span
                              key={m.modifierId ?? m.id}
                              className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-text-secondary"
                            >
                              + {m.modifierName ?? m.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-sm">{formatCurrency(item.itemTotal)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between ml-4">
                    <div className="flex items-center bg-muted rounded-xl p-1 border border-border/50 shadow-sm">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-all"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <span className="w-10 text-center text-sm font-black text-primary">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-all"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-[10px] font-bold text-error uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* Footer / Totals */}
      <div className="border-t border-border bg-surface/90 p-6">
        <div className="space-y-2.5 mb-6">
          <div className="flex justify-between text-xs font-bold text-text-secondary">
            <span>SUBTOTAL</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-text-secondary">
            <span>TAXES (5%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs font-bold text-success">
              <span>DISCOUNT</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="pt-4 mt-2 border-t-2 border-dashed border-border flex justify-between items-center">
            <span className="font-black text-sm uppercase tracking-widest">Grand Total</span>
            <span className="font-black text-2xl text-primary">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button 
            variant="outline"
            className="h-14 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 border-primary/20 text-primary flex flex-col gap-1 hover:bg-primary/5" 
            disabled={cart.length === 0 || isAiLoading}
            onClick={handleAiSuggest}
          >
            {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI
          </Button>
          <Button 
            variant="secondary" 
            className="h-14 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 border-secondary/10 flex flex-col gap-1" 
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleSendKOT}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            KOT
          </Button>
          <Button 
            variant="outline"
            className="h-14 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 flex flex-col gap-1" 
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleBill}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
            Bill
          </Button>
          <Button 
            className="h-14 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 flex flex-col gap-1" 
            disabled={cart.length === 0 || isSubmitting}
            onClick={() => setIsPaymentModalOpen(true)}
          >
            <CreditCard className="w-4 h-4" />
            Settle
          </Button>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={total}
        subtotal={subtotal}
        tax={tax}
        discount={discountAmount}
        onProcessPayment={handleProcessPayment}
        onComplete={() => {
          setIsPaymentModalOpen(false);
          clearCart();
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Phone, Mail, MapPin, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiClient } from "@/lib/api-client";
import { Customer } from "@/types";
import { toast } from "sonner";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

export function CustomerModal({ isOpen, onClose, onSelect }: CustomerModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "", address: "" });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<Customer[]>("/customers");
        setCustomers(response.data);
      } catch {
        toast.error("Failed to load customers");
      } finally {
        setIsLoading(false);
      }
    };

    setSearchQuery("");
    void loadCustomers();
  }, [isOpen]);

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) => {
        const search = searchQuery.trim().toLowerCase();
        if (!search) {
          return true;
        }

        return (
          customer.name.toLowerCase().includes(search) ||
          customer.phone.includes(search) ||
          customer.email?.toLowerCase().includes(search)
        );
      }),
    [customers, searchQuery],
  );

  const openNewCustomerForm = () => {
    const trimmedSearch = searchQuery.trim();
    const looksLikePhone = /^\d{6,}$/.test(trimmedSearch);

    setNewCustomer({
      name: looksLikePhone ? "" : trimmedSearch,
      phone: looksLikePhone ? trimmedSearch : "",
      email: "",
      address: "",
    });
    setIsAddingNew(true);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();

    const saveCustomer = async () => {
      setIsSaving(true);
      try {
        const response = await apiClient.post<Customer>("/customers", newCustomer);
        const createdCustomer = response.data;
        setCustomers((currentCustomers) => [createdCustomer, ...currentCustomers]);
        toast.success("Customer added");
        onSelect(createdCustomer);
        setIsAddingNew(false);
        setNewCustomer({ name: "", phone: "", email: "", address: "" });
        onClose();
      } catch {
        toast.error("Failed to add customer");
      } finally {
        setIsSaving(false);
      }
    };

    void saveCustomer();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-[600px] max-w-md flex-col overflow-hidden rounded-[var(--radius-xxl)] border-border/70 bg-card p-0 shadow-[var(--shadow-elevation-3)]">
        <DialogHeader className="shrink-0 border-b border-border/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-container-highest)_96%,transparent),color-mix(in_srgb,var(--primary-light)_54%,var(--surface-container-highest)))] p-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-black tracking-tight text-text-primary">Customer Selection</DialogTitle>
            <Button 
              variant={isAddingNew ? "ghost" : "outline"} 
              size="sm" 
              className="h-8 border-border/70 bg-card/80 text-xs font-bold"
              onClick={() => {
                if (isAddingNew) {
                  setIsAddingNew(false);
                } else {
                  openNewCustomerForm();
                }
              }}
            >
              {isAddingNew ? "Back to List" : "Add New"}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {isAddingNew ? (
              <motion.form 
                key="add"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-4 overflow-y-auto"
                onSubmit={handleAddCustomer}
              >
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <Input 
                      required
                      placeholder="9876543210" 
                      className="h-11 border-border/70 bg-background pl-10"
                      value={newCustomer.phone}
                      onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Full Name *</Label>
                  <Input 
                    required
                    placeholder="John Doe" 
                    className="h-11 border-border/70 bg-background"
                    value={newCustomer.name}
                    onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <Input 
                      type="email"
                      placeholder="john@example.com" 
                      className="h-11 border-border/70 bg-background pl-10"
                      value={newCustomer.email}
                      onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                    <textarea 
                      placeholder="Street, City, Pincode" 
                      className="min-h-[80px] w-full resize-none rounded-[var(--radius-large)] border border-border/70 bg-background p-3 pl-10 text-sm text-text-primary transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
                      value={newCustomer.address}
                      onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 font-bold text-lg mt-4">
                  {isSaving ? "Saving..." : "Save & Select"}
                </Button>
              </motion.form>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col h-full"
              >
                <div className="p-6 pb-2 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <Input 
                      placeholder="Search by name or phone..." 
                      className="h-11 border-border/70 bg-background pl-10"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12 text-text-muted">
                      <div className="text-sm font-bold">Loading customers...</div>
                    </div>
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          onSelect(customer);
                          onClose();
                        }}
                        className="group flex w-full items-center justify-between rounded-[var(--radius-xl)] border border-border/70 bg-card/95 p-4 text-left shadow-[var(--shadow-elevation-1)] transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-[var(--shadow-elevation-2)]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-text-secondary font-bold transition-colors group-hover:bg-primary group-hover:text-white">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-text-primary">{customer.name}</p>
                            <p className="text-xs font-bold text-text-muted">{customer.phone}</p>
                            {customer.totalSpent ? (
                              <p className="mt-0.5 text-[11px] text-text-secondary">
                                {customer.totalOrders ?? 0} orders • Rs. {customer.totalSpent.toFixed(0)} lifetime spend
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-surface/80 transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                          <Check className="w-4 h-4" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                      <UserPlus className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-bold text-sm">No customers found</p>
                      <Button 
                        variant="link" 
                        className="font-bold text-primary"
                        onClick={openNewCustomerForm}
                      >
                        Add &quot;{searchQuery}&quot; as new customer
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

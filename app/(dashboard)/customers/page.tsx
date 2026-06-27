"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Customer } from "@/types";
import { formatCurrency } from "@/lib/utils/currency";

const emptyCustomerForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  gstNumber: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);

  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<Customer[]>("/customers");
        setCustomers(response.data);
      } catch (error) {
        toast.error("Failed to load customers");
      } finally {
        setIsLoading(false);
      }
    };

    void loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const customersWithGst = customers.filter((customer) => Boolean(customer.gstNumber)).length;

  const deleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await apiClient.delete(`/customers/${id}`);
      setCustomers((currentCustomers) => currentCustomers.filter((customer) => customer.id !== id));
      toast.success("Customer deleted");
    } catch (error) {
      toast.error("Failed to delete customer");
    }
  };

  const openCreateDialog = () => {
    setEditingCustomer(null);
    setCustomerForm(emptyCustomerForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name ?? "",
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      address: customer.address ?? "",
      gstNumber: customer.gstNumber ?? "",
    });
    setIsDialogOpen(true);
  };

  const saveCustomer = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      if (editingCustomer) {
        const response = await apiClient.patch<Customer>(`/customers/${editingCustomer.id}`, customerForm);
        setCustomers((currentCustomers) =>
          currentCustomers.map((customer) => (customer.id === response.data.id ? response.data : customer)),
        );
        toast.success("Customer updated");
      } else {
        const response = await apiClient.post<Customer>("/customers", customerForm);
        setCustomers((currentCustomers) => [response.data, ...currentCustomers]);
        toast.success("Customer added");
      }

      setIsDialogOpen(false);
      setEditingCustomer(null);
      setCustomerForm(emptyCustomerForm);
    } catch (error) {
      toast.error(editingCustomer ? "Failed to update customer" : "Failed to add customer");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-canvas flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-7xl p-6">
          <div className="app-panel flex min-h-[320px] w-full items-center justify-center rounded-[var(--radius-xxl)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-canvas flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
        <section className="app-panel relative overflow-hidden rounded-[var(--radius-xxl)] p-6 sm:p-8">
          <div className="app-hero-glow absolute inset-0" />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                  <User className="h-3.5 w-3.5" />
                  Bhukkad Guestbook
                </div>
                <div className="space-y-2">
                  <h1 className="brand-display text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                    Customer profiles with cleaner service context
                  </h1>
                  <p className="max-w-3xl text-sm leading-7 text-text-secondary sm:text-base">
                    Keep contact history, GST-linked profiles, and repeat guest lookup aligned with
                    the rest of the operating dashboard.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryTile label="Profiles" value={customers.length.toString()} />
                <SummaryTile label="Visible" value={filteredCustomers.length.toString()} />
                <SummaryTile label="GST Linked" value={customersWithGst.toString()} />
              </div>
            </div>

            <div className="app-panel-subtle flex flex-col gap-3 rounded-[var(--radius-xl)] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 rounded-[var(--radius-large)] border-border/70 bg-background pl-11 text-sm font-medium"
                />
              </div>
              <Button className="gap-2 font-bold shadow-lg shadow-primary/15" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            </div>
          </div>
        </section>

        <Card className="overflow-hidden rounded-[var(--radius-xxl)] border-border/70 bg-card/95 shadow-[var(--shadow-elevation-1)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">Customer</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">Contact</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">Total Orders</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">Total Spent</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">Last Visit</TableHead>
                <TableHead className="text-right text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-text-muted">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary shadow-[var(--shadow-elevation-1)]">
                          {customer.name?.charAt(0) || <User className="h-5 w-5" />}
                        </div>
                        <div className="font-medium text-text-primary">{customer.name || "Unknown"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-text-primary">{customer.phone}</div>
                        <div className="text-text-muted">{customer.email || "No email added"}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-text-primary">
                      {customer.totalOrders || 0}
                    </TableCell>
                    <TableCell className="font-semibold text-text-primary">
                      {formatCurrency(customer.totalSpent || 0)}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {customer.lastVisit ? format(new Date(customer.lastVisit), "dd MMM yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {customer.gstNumber ? (
                          <Badge variant="secondary" className="font-bold">
                            GST
                          </Badge>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-text-secondary hover:bg-primary/10 hover:text-primary"
                          onClick={() => openEditDialog(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                          onClick={() => deleteCustomer(customer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="rounded-[var(--radius-xxl)] border-border/70 bg-card shadow-[var(--shadow-elevation-3)]">
            <DialogHeader>
              <DialogTitle className="text-text-primary">{editingCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
            </DialogHeader>

            <form className="space-y-4" onSubmit={saveCustomer}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  required
                  placeholder="Full name"
                  value={customerForm.name}
                  onChange={(event) => setCustomerForm((current) => ({ ...current, name: event.target.value }))}
                  className="border-border/70 bg-background"
                />
                <Input
                  required
                  placeholder="Phone number"
                  value={customerForm.phone}
                  onChange={(event) => setCustomerForm((current) => ({ ...current, phone: event.target.value }))}
                  className="border-border/70 bg-background"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={customerForm.email}
                  onChange={(event) => setCustomerForm((current) => ({ ...current, email: event.target.value }))}
                  className="border-border/70 bg-background"
                />
                <Input
                  placeholder="GST number"
                  value={customerForm.gstNumber}
                  onChange={(event) => setCustomerForm((current) => ({ ...current, gstNumber: event.target.value }))}
                  className="border-border/70 bg-background"
                />
              </div>

              <textarea
                placeholder="Address or notes"
                className="min-h-24 w-full rounded-[var(--radius-large)] border border-border/70 bg-background px-3 py-2 text-sm text-text-primary outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={customerForm.address}
                onChange={(event) => setCustomerForm((current) => ({ ...current, address: event.target.value }))}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingCustomer ? "Save Changes" : "Add Customer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="app-panel-subtle min-w-[140px] rounded-[var(--radius-xl)] px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
    </div>
  );
}

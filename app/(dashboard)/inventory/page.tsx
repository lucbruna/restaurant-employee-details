"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await apiClient.get("/inventory");
        setItems(res.data);
      } catch (error) {
        toast.error("Failed to load inventory");
      } finally {
        setIsLoading(false);
      }
    }
    fetchInventory();
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const lowStockCount = items.filter((item) => item.currentStock <= (item.minimumStock || 0)).length;

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await apiClient.delete(`/inventory/${id}`);
      setItems(items.filter(i => i.id !== id));
      toast.success("Item deleted");
    } catch (error) {
      toast.error("Failed to delete item");
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
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Bhukkad Stockroom
                </div>
                <div className="space-y-2">
                  <h1 className="brand-display text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                    Inventory control with calmer operating contrast
                  </h1>
                  <p className="max-w-3xl text-sm leading-7 text-text-secondary sm:text-base">
                    Review ingredient levels, SKU coverage, and low-stock risk from the same
                    polished dashboard language used everywhere else.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryTile label="Stock Items" value={items.length.toString()} />
                <SummaryTile label="Low Stock" value={lowStockCount.toString()} />
                <SummaryTile label="Visible" value={filteredItems.length.toString()} />
              </div>
            </div>

            <div className="app-panel-subtle flex flex-col gap-3 rounded-[var(--radius-xl)] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  placeholder="Search item name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 rounded-[var(--radius-large)] border-border/70 bg-background pl-11 text-sm font-medium"
                />
              </div>
              <Button className="gap-2 font-bold shadow-lg shadow-primary/15">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>
        </section>

        <Card className="overflow-hidden rounded-[var(--radius-xxl)] border-border/70 bg-card/95 shadow-[var(--shadow-elevation-1)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">Name</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">SKU</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">Category</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">Quantity</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">Unit</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">Status</TableHead>
                <TableHead className="text-right text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-text-muted">
                    No inventory items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium text-text-primary">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {item.sku || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-surface">
                        {item.category || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-text-primary">
                      {item.currentStock}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {item.unit}
                    </TableCell>
                    <TableCell>
                      {item.currentStock <= (item.minimumStock || 0) ? (
                        <Badge variant="outline" className="gap-1 border-destructive/20 bg-destructive/10 text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-success/20 bg-success/10 text-success">
                          In Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-text-secondary hover:bg-primary/10 hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10" onClick={() => deleteItem(item.id)}>
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

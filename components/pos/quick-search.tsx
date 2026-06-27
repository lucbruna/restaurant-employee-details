"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MenuItem } from "@/types";
import { usePosStore } from "@/hooks/use-pos-store";
import { formatCurrency } from "@/lib/utils/currency";

interface QuickSearchProps {
  items: MenuItem[];
}

export function QuickSearch({ items }: QuickSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { addToCart } = usePosStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = query.trim() === "" 
    ? [] 
    : items.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.shortCode?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5); // Limit to 5 results

  const handleSelect = (item: MenuItem) => {
    addToCart(item);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search items (Cmd+K)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-12 h-12 text-lg bg-surface border-border focus-visible:ring-primary/30 rounded-xl"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-muted/50 text-xs font-medium text-muted-foreground">
            <Command className="w-3 h-3" /> K
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50">
          {filteredItems.length > 0 ? (
            <ul className="py-2">
              {filteredItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      {item.shortCode && <p className="text-xs text-muted-foreground uppercase">{item.shortCode}</p>}
                    </div>
                    <span className="font-bold text-primary">{formatCurrency(item.basePrice)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No items found matching &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

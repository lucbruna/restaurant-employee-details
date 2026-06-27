"use client";

import { useState } from "react";
import { Category } from "@/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { motion } from "motion/react";

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onSelect: (id: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <div className="bg-surface border-b border-border px-4 py-3 relative z-10">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2 pb-2">
          <button
            onClick={() => onSelect("all")}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "all" ? "text-primary-foreground" : "bg-muted text-text-secondary hover:bg-border"
            }`}
          >
            {activeCategory === "all" && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 bg-primary rounded-full -z-10 shadow-md"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">All Items</span>
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                activeCategory === cat.id ? "text-primary-foreground" : "bg-muted text-text-secondary hover:bg-border"
              }`}
            >
              {activeCategory === cat.id && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-primary rounded-full -z-10 shadow-md"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span>{cat.emoji}</span> {cat.name}
              </span>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}

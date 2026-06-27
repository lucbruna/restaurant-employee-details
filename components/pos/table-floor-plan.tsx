"use client";

import { useState } from "react";
import { Table } from "@/types";
import { usePosStore } from "@/hooks/use-pos-store";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

interface TableFloorPlanProps {
  tables: Table[];
  sections: any[];
  onSelect?: () => void;
}

export function TableFloorPlan({ tables, sections, onSelect }: TableFloorPlanProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id);
  const { selectedTableId, setTable, setOrderType } = usePosStore();

  const sectionTables = tables.filter(t => t.sectionId === activeSection);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-surface border-success/30 text-success shadow-sm hover:border-success/60';
      case 'occupied': return 'bg-warning/5 border-warning/40 text-warning shadow-sm hover:border-warning/70';
      case 'reserved': return 'bg-info/5 border-info/40 text-info shadow-sm hover:border-info/70';
      case 'dirty': return 'bg-destructive/5 border-destructive/40 text-destructive shadow-sm hover:border-destructive/70';
      default: return 'bg-muted border-border text-muted-foreground';
    }
  };

  const handleTableSelect = (tableId: string) => {
    setTable(tableId);
    if (onSelect) onSelect();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg mb-3">Floor Plan</h2>
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex space-x-2">
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                  activeSection === sec.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-text-secondary hover:bg-border"
                )}
              >
                {sec.name}
              </button>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex items-center gap-4 mt-4 px-1 overflow-x-auto scrollbar-hide">
          <StatusLegend color="bg-surface border-success/30" label="Available" />
          <StatusLegend color="bg-warning/10 border-warning/40" label="Occupied" />
          <StatusLegend color="bg-info/10 border-info/40" label="Reserved" />
          <StatusLegend color="bg-destructive/10 border-destructive/40" label="Dirty" />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-3 gap-3">
          {sectionTables.map(table => {
            const isSelected = selectedTableId === table.id;
            const statusColors = getStatusColor(table.status);
            const isCircle = table.shape === 'circle';

            return (
              <button
                key={table.id}
                onClick={() => handleTableSelect(table.id)}
                className={cn(
                  "relative aspect-square flex flex-col items-center justify-center border-2 transition-all duration-200",
                  isCircle ? "rounded-full" : "rounded-xl",
                  statusColors,
                  isSelected && "ring-4 ring-primary/30 ring-offset-2 scale-95",
                  table.status === 'occupied' && !isSelected && "animate-pulse-border"
                )}
              >
                <span className="font-bold text-lg">{table.name}</span>
                <div className="flex items-center text-[10px] mt-1 opacity-80 font-medium">
                  <Users className="w-3 h-3 mr-1" />
                  {table.capacity}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-surface">
        <Button 
          variant="outline" 
          className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
          onClick={() => {
            setTable(null);
            setOrderType('takeaway');
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Direct Order
        </Button>
      </div>
    </div>
  );
}

function StatusLegend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className={cn("w-3 h-3 rounded-full border", color)} />
      <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">{label}</span>
    </div>
  );
}

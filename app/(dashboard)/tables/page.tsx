"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Table } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Save, Square, Circle, RectangleHorizontal } from "lucide-react";
import { toast } from "sonner";
import { ReservationModal } from "@/components/pos/reservation-modal";
import { AIChatbot } from "@/components/pos/ai-chatbot";
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiClient.get("/tables");
        setTables(res.data.tables);
        setSections(res.data.sections);
        if (res.data.sections.length > 0) {
          setActiveSection(res.data.sections[0].id);
        }
      } catch (error) {
        toast.error("Failed to load tables");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!active) return;

    setTables(prev => prev.map(t => {
      if (t.id === active.id) {
        return {
          ...t,
          positionX: Math.max(0, t.positionX + delta.x),
          positionY: Math.max(0, t.positionY + delta.y),
        };
      }
      return t;
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.post("/tables/bulk", { tables });
      setHasChanges(false);
      toast.success("Table layout saved");
    } catch (error) {
      toast.error("Failed to save layout");
    } finally {
      setIsSaving(false);
    }
  };

  const addTable = () => {
    const newTable: Table = {
      id: `t-${Date.now()}`,
      sectionId: activeSection,
      name: `T${tables.length + 1}`,
      capacity: 4,
      shape: 'rectangle',
      status: 'available',
      positionX: 50,
      positionY: 50,
      width: 100,
      height: 100,
    };
    setTables([...tables, newTable]);
    setSelectedTable(newTable);
    setHasChanges(true);
  };

  const updateSelectedTable = (updates: Partial<Table>) => {
    if (!selectedTable) return;
    const updated = { ...selectedTable, ...updates };
    setSelectedTable(updated);
    setTables(prev => prev.map(t => t.id === updated.id ? updated : t));
    setHasChanges(true);
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const sectionTables = tables.filter(t => t.sectionId === activeSection);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-surface border-b border-border">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Table Layout</h1>
          <div className="h-6 w-px bg-border mx-2" />
          <div className="flex bg-muted p-1 rounded-lg">
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => { setActiveSection(sec.id); setSelectedTable(null); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeSection === sec.id ? "bg-surface shadow-sm text-primary" : "text-text-secondary hover:text-text-primary"}`}
              >
                {sec.name}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="ml-2"><Plus className="w-4 h-4 mr-2" /> Section</Button>
        </div>

        <div className="flex items-center gap-3">
          <AIChatbot inline />
          <Button variant="outline" onClick={addTable}>
            <Plus className="w-4 h-4 mr-2" /> Add Table
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="relative">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Layout
            {hasChanges && <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full border-2 border-surface" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative bg-[#F7F8FC] overflow-hidden" style={{ backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          <DndContext sensors={sensors} modifiers={[restrictToParentElement]} onDragEnd={handleDragEnd}>
            {sectionTables.map(table => (
              <DraggableTable 
                key={table.id} 
                table={table} 
                isSelected={selectedTable?.id === table.id}
                onClick={() => setSelectedTable(table)}
              />
            ))}
          </DndContext>
        </div>

        {/* Properties Panel */}
        {selectedTable && (
          <div className="w-80 bg-surface border-l border-border flex flex-col shadow-xl z-10">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h3 className="font-semibold">Table Properties</h3>
              <button onClick={() => setSelectedTable(null)} className="text-text-muted hover:text-text-primary">✕</button>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Table Name</label>
                  <Input 
                    value={selectedTable.name} 
                    onChange={(e) => updateSelectedTable({ name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Capacity (Pax)</label>
                  <div className="flex items-center border border-input rounded-md overflow-hidden">
                    <button className="px-3 py-2 bg-muted hover:bg-border transition-colors" onClick={() => updateSelectedTable({ capacity: Math.max(1, selectedTable.capacity - 1) })}>-</button>
                    <div className="flex-1 text-center font-semibold">{selectedTable.capacity}</div>
                    <button className="px-3 py-2 bg-muted hover:bg-border transition-colors" onClick={() => updateSelectedTable({ capacity: selectedTable.capacity + 1 })}>+</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Shape</label>
                  <div className="grid grid-cols-3 gap-2">
                    <ShapeButton 
                      icon={<Square className="w-5 h-5" />} 
                      active={selectedTable.shape === 'square'} 
                      onClick={() => updateSelectedTable({ shape: 'square' })} 
                    />
                    <ShapeButton 
                      icon={<RectangleHorizontal className="w-5 h-5" />} 
                      active={selectedTable.shape === 'rectangle'} 
                      onClick={() => updateSelectedTable({ shape: 'rectangle' })} 
                    />
                    <ShapeButton 
                      icon={<Circle className="w-5 h-5" />} 
                      active={selectedTable.shape === 'circle'} 
                      onClick={() => updateSelectedTable({ shape: 'circle' })} 
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-border space-y-3">
                  <Button 
                    className="w-full bg-primary hover:bg-primary-dark"
                    onClick={() => setShowReservationModal(true)}
                  >
                    Reserve Table
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={async () => {
                      if (!confirm("Are you sure you want to delete this table?")) return;
                      try {
                        // If it's a newly added table (not saved yet), we might not need to call API
                        // But calling it is fine, it will just 404 or we can check if it starts with 't-'
                        if (!selectedTable.id.startsWith('t-')) {
                          await apiClient.delete(`/tables/${selectedTable.id}`);
                        }
                        setTables(tables.filter(t => t.id !== selectedTable.id));
                        setSelectedTable(null);
                        setHasChanges(true);
                        toast.success("Table deleted");
                      } catch (error) {
                        toast.error("Failed to delete table");
                      }
                    }}
                  >
                    Delete Table
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
      <ReservationModal 
        isOpen={showReservationModal} 
        onClose={() => setShowReservationModal(false)}
        tableId={selectedTable?.id || ""}
        tableName={selectedTable?.name || ""}
      />
    </div>
  );
}

function ShapeButton({ icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`h-12 flex items-center justify-center rounded-md border transition-all ${
        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface text-text-secondary hover:bg-muted"
      }`}
    >
      {icon}
    </button>
  );
}

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function DraggableTable({ table, isSelected, onClick }: { table: Table, isSelected: boolean, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: table.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    left: table.positionX,
    top: table.positionY,
    width: table.shape === 'rectangle' ? 120 : 80,
    height: 80,
  };

  const isCircle = table.shape === 'circle';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`absolute flex flex-col items-center justify-center bg-white border-2 cursor-grab active:cursor-grabbing shadow-sm transition-shadow ${
        isCircle ? "rounded-full aspect-square w-20" : "rounded-xl"
      } ${isSelected ? "border-primary ring-4 ring-primary/20 shadow-lg z-10" : "border-border hover:border-primary/50"}`}
    >
      <span className="font-bold text-lg text-text-primary">{table.name}</span>
      <span className="text-xs text-text-muted font-medium">{table.capacity} Pax</span>
      
      {isSelected && (
        <>
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full" />
        </>
      )}
    </div>
  );
}

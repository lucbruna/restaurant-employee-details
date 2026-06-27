"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils/currency";

export function ModifiersTab() {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [editingModifier, setEditingModifier] = useState<any>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      const res = await apiClient.get("/menu/modifierGroups");
      setGroups(res.data);
    } catch (error) {
      toast.error("Failed to load modifier groups");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => 
      prev.includes(id) ? prev.filter(gId => gId !== id) : [...prev, id]
    );
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("Delete this modifier group?")) return;
    try {
      await apiClient.delete(`/menu/modifierGroups/${id}`);
      setGroups(groups.filter(g => g.id !== id));
      toast.success("Group deleted");
    } catch (error) {
      toast.error("Failed to delete group");
    }
  };

  const deleteModifier = async (id: string, groupId: string) => {
    if (!confirm("Delete this modifier?")) return;
    try {
      await apiClient.delete(`/menu/modifiers/${id}`);
      setGroups(groups.map(g => {
        if (g.id === groupId) {
          return { ...g, modifiers: g.modifiers.filter((m: any) => m.id !== id) };
        }
        return g;
      }));
      toast.success("Modifier deleted");
    } catch (error) {
      toast.error("Failed to delete modifier");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-text-primary">Modifier Groups</h3>
        <Button onClick={() => { setEditingGroup(null); setIsGroupModalOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card className="border-border shadow-sm p-8 text-center text-text-muted">
          <p>No modifier groups found. Create one to get started.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <Card key={group.id} className="border-border shadow-sm overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 bg-surface cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleGroup(group.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedGroups.includes(group.id) ? <ChevronDown className="w-5 h-5 text-text-muted" /> : <ChevronRight className="w-5 h-5 text-text-muted" />}
                  <div>
                    <h4 className="font-semibold text-primary">{group.name}</h4>
                    <p className="text-xs text-text-muted">
                      {group.selectionType === 'single' ? 'Single Selection' : `Multiple Selection (${group.minSelections}-${group.maxSelections})`}
                      {group.isRequired && ' • Required'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedGroupId(group.id); setEditingModifier(null); setIsModifierModalOpen(true); }}>
                    <Plus className="w-3 h-3 mr-1" /> Add Modifier
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setEditingGroup(group); setIsGroupModalOpen(true); }}>
                    <Edit className="w-4 h-4 text-text-secondary" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteGroup(group.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {expandedGroups.includes(group.id) && (
                <div className="border-t border-border bg-background p-4">
                  {group.modifiers?.length === 0 ? (
                    <p className="text-sm text-text-muted text-center py-4">No modifiers in this group.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/20">
                          <TableHead>Name</TableHead>
                          <TableHead>Price Delta</TableHead>
                          <TableHead>Default</TableHead>
                          <TableHead>Active</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.modifiers?.map((mod: any) => (
                          <TableRow key={mod.id}>
                            <TableCell className="font-medium">{mod.name}</TableCell>
                            <TableCell>{mod.priceDelta > 0 ? `+${formatCurrency(mod.priceDelta)}` : mod.priceDelta < 0 ? `-${formatCurrency(Math.abs(mod.priceDelta))}` : '-'}</TableCell>
                            <TableCell>{mod.isDefault ? 'Yes' : 'No'}</TableCell>
                            <TableCell>
                              <Switch 
                                checked={mod.isActive} 
                                onCheckedChange={async () => {
                                  try {
                                    await apiClient.patch(`/menu/modifiers/${mod.id}`, { isActive: !mod.isActive });
                                    fetchGroups();
                                  } catch (e) {
                                    toast.error("Failed to update status");
                                  }
                                }} 
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedGroupId(group.id); setEditingModifier(mod); setIsModifierModalOpen(true); }}>
                                <Edit className="w-4 h-4 text-text-secondary" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteModifier(mod.id, group.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Group Modal */}
      <GroupModal 
        isOpen={isGroupModalOpen} 
        onClose={() => setIsGroupModalOpen(false)} 
        group={editingGroup} 
        onSuccess={fetchGroups} 
      />

      {/* Modifier Modal */}
      <ModifierModal 
        isOpen={isModifierModalOpen} 
        onClose={() => setIsModifierModalOpen(false)} 
        modifier={editingModifier} 
        groupId={selectedGroupId}
        onSuccess={fetchGroups} 
      />
    </div>
  );
}

function GroupModal({ isOpen, onClose, group, onSuccess }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    selectionType: "single",
    minSelections: 0,
    maxSelections: 1,
    isRequired: false,
  });

  useEffect(() => {
    if (group && isOpen) {
      setFormData({
        name: group.name,
        selectionType: group.selectionType,
        minSelections: group.minSelections,
        maxSelections: group.maxSelections,
        isRequired: group.isRequired,
      });
    } else if (isOpen) {
      setFormData({ name: "", selectionType: "single", minSelections: 0, maxSelections: 1, isRequired: false });
    }
  }, [group, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (group) {
        await apiClient.patch(`/menu/modifierGroups/${group.id}`, formData);
        toast.success("Group updated");
      } else {
        await apiClient.post("/menu/modifierGroups", formData);
        toast.success("Group created");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save group");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={open => !open && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{group ? "Edit Group" : "Add Group"}</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Crust Type" />
          </div>
          
          <div className="space-y-2">
            <Label>Selection Type</Label>
            <Select value={formData.selectionType} onValueChange={v => setFormData({...formData, selectionType: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Selection</SelectItem>
                <SelectItem value="multiple">Multiple Selection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.selectionType === 'multiple' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Selections</Label>
                <Input type="number" min="0" value={formData.minSelections} onChange={e => setFormData({...formData, minSelections: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Max Selections</Label>
                <Input type="number" min="1" value={formData.maxSelections} onChange={e => setFormData({...formData, maxSelections: parseInt(e.target.value)})} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="space-y-0.5">
              <Label>Required</Label>
              <p className="text-xs text-text-muted">Must select at least one</p>
            </div>
            <Switch checked={formData.isRequired} onCheckedChange={v => setFormData({...formData, isRequired: v})} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Group
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}

function ModifierModal({ isOpen, onClose, modifier, groupId, onSuccess }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    priceDelta: 0,
    isDefault: false,
    isActive: true,
  });

  useEffect(() => {
    if (modifier && isOpen) {
      setFormData({
        name: modifier.name,
        priceDelta: modifier.priceDelta,
        isDefault: modifier.isDefault,
        isActive: modifier.isActive,
      });
    } else if (isOpen) {
      setFormData({ name: "", priceDelta: 0, isDefault: false, isActive: true });
    }
  }, [modifier, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modifier) {
        await apiClient.patch(`/menu/modifiers/${modifier.id}`, formData);
        toast.success("Modifier updated");
      } else {
        await apiClient.post("/menu/modifiers", { ...formData, groupId });
        toast.success("Modifier created");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save modifier");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={open => !open && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{modifier ? "Edit Modifier" : "Add Modifier"}</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Extra Cheese" />
          </div>
          
          <div className="space-y-2">
            <Label>Price Delta (₹)</Label>
            <Input type="number" step="0.01" value={formData.priceDelta} onChange={e => setFormData({...formData, priceDelta: parseFloat(e.target.value)})} placeholder="0.00" />
            <p className="text-xs text-text-muted">Use negative values for discounts</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="space-y-0.5">
              <Label>Default Selection</Label>
              <p className="text-xs text-text-muted">Pre-selected by default</p>
            </div>
            <Switch checked={formData.isDefault} onCheckedChange={v => setFormData({...formData, isDefault: v})} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Modifier
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}

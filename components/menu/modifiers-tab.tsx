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
      toast.error("Falha ao carregar grupos de modificadores");
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
    if (!confirm("Excluir este grupo de modificadores?")) return;
    try {
      await apiClient.delete(`/menu/modifierGroups/${id}`);
      setGroups(groups.filter(g => g.id !== id));
      toast.success("Grupo excluído");
    } catch (error) {
      toast.error("Falha ao excluir grupo");
    }
  };

  const deleteModifier = async (id: string, groupId: string) => {
    if (!confirm("Excluir este modificador?")) return;
    try {
      await apiClient.delete(`/menu/modifiers/${id}`);
      setGroups(groups.map(g => {
        if (g.id === groupId) {
          return { ...g, modifiers: g.modifiers.filter((m: any) => m.id !== id) };
        }
        return g;
      }));
      toast.success("Modificador excluído");
    } catch (error) {
      toast.error("Falha ao excluir modificador");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-text-primary">Grupos de Modificadores</h3>
        <Button onClick={() => { setEditingGroup(null); setIsGroupModalOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Adicionar Grupo
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card className="border-border shadow-sm p-8 text-center text-text-muted">
          <p>Nenhum grupo de modificadores encontrado. Crie um para começar.</p>
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
                      {group.selectionType === 'single' ? 'Seleção Única' : `Seleção Múltipla (${group.minSelections}-${group.maxSelections})`}
                      {group.isRequired && ' • Obrigatório'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedGroupId(group.id); setEditingModifier(null); setIsModifierModalOpen(true); }}>
                    <Plus className="w-3 h-3 mr-1" /> Adicionar Modificador
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
                    <p className="text-sm text-text-muted text-center py-4">Nenhum modificador neste grupo.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/20">
                          <TableHead>Nome</TableHead>
                          <TableHead>Delta Preço</TableHead>
                          <TableHead>Padrão</TableHead>
                          <TableHead>Ativo</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.modifiers?.map((mod: any) => (
                          <TableRow key={mod.id}>
                            <TableCell className="font-medium">{mod.name}</TableCell>
                            <TableCell>{mod.priceDelta > 0 ? `+${formatCurrency(mod.priceDelta)}` : mod.priceDelta < 0 ? `-${formatCurrency(Math.abs(mod.priceDelta))}` : '-'}</TableCell>
                            <TableCell>{mod.isDefault ? 'Sim' : 'Não'}</TableCell>
                            <TableCell>
                              <Switch 
                                checked={mod.isActive} 
                                onCheckedChange={async () => {
                                  try {
                                    await apiClient.patch(`/menu/modifiers/${mod.id}`, { isActive: !mod.isActive });
                                    fetchGroups();
                                  } catch (e) {
                                    toast.error("Falha ao atualizar status");
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
        toast.success("Grupo atualizado");
      } else {
        await apiClient.post("/menu/modifierGroups", formData);
        toast.success("Grupo criado");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Falha ao salvar grupo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={open => !open && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{group ? "Editar Grupo" : "Adicionar Grupo"}</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="ex: Tipo de Massa" />
          </div>
          
          <div className="space-y-2">
            <Label>Tipo de Seleção</Label>
            <Select value={formData.selectionType} onValueChange={v => setFormData({...formData, selectionType: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Seleção Única</SelectItem>
                <SelectItem value="multiple">Seleção Múltipla</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.selectionType === 'multiple' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mín. Seleções</Label>
                <Input type="number" min="0" value={formData.minSelections} onChange={e => setFormData({...formData, minSelections: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Máx. Seleções</Label>
                <Input type="number" min="1" value={formData.maxSelections} onChange={e => setFormData({...formData, maxSelections: parseInt(e.target.value)})} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="space-y-0.5">
              <Label>Obrigatório</Label>
              <p className="text-xs text-text-muted">Deve selecionar pelo menos um</p>
            </div>
            <Switch checked={formData.isRequired} onCheckedChange={v => setFormData({...formData, isRequired: v})} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Grupo
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
        toast.success("Modificador atualizado");
      } else {
        await apiClient.post("/menu/modifiers", { ...formData, groupId });
        toast.success("Modificador criado");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Falha ao salvar modificador");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={open => !open && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{modifier ? "Editar Modificador" : "Adicionar Modificador"}</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="ex: Queijo Extra" />
          </div>
          
          <div className="space-y-2">
            <Label>Delta Preço (₹)</Label>
            <Input type="number" step="0.01" value={formData.priceDelta} onChange={e => setFormData({...formData, priceDelta: parseFloat(e.target.value)})} placeholder="0,00" />
            <p className="text-xs text-text-muted">Use valores negativos para descontos</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="space-y-0.5">
              <Label>Seleção Padrão</Label>
              <p className="text-xs text-text-muted">Pré-selecionado por padrão</p>
            </div>
            <Switch checked={formData.isDefault} onCheckedChange={v => setFormData({...formData, isDefault: v})} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Modificador
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}

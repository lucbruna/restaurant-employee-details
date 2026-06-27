"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId?: string | null;
  tableName?: string | null;
  onSuccess?: () => void;
}

function toLocalDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLocalTimeInputValue(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

function createDefaultReservationForm() {
  const now = new Date();
  const nextSlot = new Date(now);
  nextSlot.setHours(now.getHours() + 1, 0, 0, 0);

  return {
    customerName: "",
    phone: "",
    guests: 2,
    notes: "",
    date: toLocalDateInputValue(nextSlot),
    time: toLocalTimeInputValue(nextSlot),
  };
}

export function ReservationModal({
  isOpen,
  onClose,
  tableId,
  tableName,
  onSuccess,
}: ReservationModalProps) {
  const [formData, setFormData] = useState(createDefaultReservationForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(createDefaultReservationForm());
    }
  }, [isOpen, tableId]);

  const handleSubmit = async () => {
    const normalizedTableId =
      typeof tableId === "string" && tableId.trim().length > 0
        ? tableId.trim()
        : null;

    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.date || !formData.time) {
      toast.error("Nome do cliente, telefone, data e hora são obrigatórios.");
      return;
    }

    if (!Number.isFinite(formData.guests) || formData.guests < 1) {
      toast.error("A reserva deve incluir pelo menos um cliente.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/reservations", {
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        date: formData.date,
        time: formData.time,
        guests: formData.guests,
        notes: formData.notes.trim(),
        tableId: normalizedTableId,
      });

      toast.success(
        normalizedTableId
          ? "Mesa reservada com sucesso."
          : "Reserva adicionada com sucesso.",
      );
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Falha ao salvar a reserva. Por favor, tente novamente.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {tableName ? `Reservar Mesa ${tableName}` : "Adicionar Reserva"}
          </DialogTitle>
          <DialogDescription>
            Capture os detalhes do cliente agora para que a equipe de salão possa acomodá-los sem problemas mais tarde.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Cliente</Label>
            <Input 
              value={formData.customerName} 
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Número de Telefone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Número de Convidados</Label>
            <Input
              type="number"
              min={1}
              value={formData.guests}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  guests: Math.max(1, Number.parseInt(e.target.value || "1", 10)),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Observações Especiais</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {tableName ? "Reservar" : "Criar Reserva"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

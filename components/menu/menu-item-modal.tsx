"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Category } from "@/types";

const menuItemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  shortCode: z.string().optional(),
  basePrice: z.coerce.number().min(0, "Preço deve ser positivo"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  foodType: z.enum(["veg", "non_veg", "vegan", "egg"]),
  spiceLevel: z.coerce.number().min(0).max(5).default(0),
  prepTimeMinutes: z.coerce.number().min(0).default(15),
  isActive: z.boolean().default(true),
  isBestseller: z.boolean().default(false),
});

type MenuItemFormInput = z.input<typeof menuItemSchema>;
type MenuItemFormValues = z.output<typeof menuItemSchema>;

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any; // If editing
  categories: Category[];
  onSuccess: () => void;
}

export function MenuItemModal({ isOpen, onClose, item, categories, onSuccess }: MenuItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MenuItemFormInput, unknown, MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      shortCode: "",
      basePrice: 0,
      categoryId: "",
      foodType: "veg",
      spiceLevel: 0,
      prepTimeMinutes: 15,
      isActive: true,
      isBestseller: false,
    },
  });

  useEffect(() => {
    if (item && isOpen) {
      reset({
        name: item.name,
        description: item.description || "",
        shortCode: item.shortCode || "",
        basePrice: item.basePrice || item.price || 0,
        categoryId: item.categoryId,
        foodType: item.foodType || "veg",
        spiceLevel: item.spiceLevel || 0,
        prepTimeMinutes: item.prepTimeMinutes || 15,
        isActive: item.isActive,
        isBestseller: item.isBestseller || false,
      });
    } else if (isOpen) {
      reset();
    }
  }, [item, isOpen, reset]);

  const onSubmit = async (data: MenuItemFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = item?.imageUrl ? { ...data, imageUrl: item.imageUrl } : data;
      
      if (item) {
        await apiClient.patch(`/menu/items/${item.id}`, payload);
        toast.success("Item atualizado com sucesso");
      } else {
        await apiClient.post("/menu/items", payload);
        toast.success("Item criado com sucesso");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error(item ? "Falha ao atualizar item" : "Falha ao criar item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>{item ? "Editar Item do Cardápio" : "Adicionar Item do Cardápio"}</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input {...register("name")} placeholder="ex: Paneer Tikka" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Código Curto</Label>
              <Input {...register("shortCode")} placeholder="ex: PT" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input {...register("description")} placeholder="Breve descrição do item" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preço Base (₹) *</Label>
              <Input type="number" step="0.01" {...register("basePrice")} placeholder="0,00" />
              {errors.basePrice && <p className="text-xs text-destructive">{errors.basePrice.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select onValueChange={(val) => setValue("categoryId", val)} defaultValue={watch("categoryId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Alimento</Label>
              <Select onValueChange={(val: any) => setValue("foodType", val)} defaultValue={watch("foodType")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Vegetariano</SelectItem>
                  <SelectItem value="non_veg">Não Vegetariano</SelectItem>
                  <SelectItem value="vegan">Vegano</SelectItem>
                  <SelectItem value="egg">Contém Ovo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nível de Picância (0-5)</Label>
              <Input type="number" min="0" max="5" {...register("spiceLevel")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="space-y-0.5">
                <Label>Ativo</Label>
                <p className="text-xs text-text-muted">Disponível para pedidos</p>
              </div>
              <Switch checked={watch("isActive")} onCheckedChange={(val) => setValue("isActive", val)} />
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="space-y-0.5">
                <Label>Mais Vendido</Label>
                <p className="text-xs text-text-muted">Destacar no cardápio</p>
              </div>
              <Switch checked={watch("isBestseller")} onCheckedChange={(val) => setValue("isBestseller", val)} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {item ? "Atualizar Item" : "Criar Item"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}

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
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  shortCode: z.string().optional(),
  basePrice: z.coerce.number().min(0, "Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
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
        toast.success("Item updated successfully");
      } else {
        await apiClient.post("/menu/items", payload);
        toast.success("Item created successfully");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error(item ? "Failed to update item" : "Failed to create item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>{item ? "Edit Menu Item" : "Add Menu Item"}</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input {...register("name")} placeholder="e.g. Paneer Tikka" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Short Code</Label>
              <Input {...register("shortCode")} placeholder="e.g. PT" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input {...register("description")} placeholder="Brief description of the item" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Base Price (₹) *</Label>
              <Input type="number" step="0.01" {...register("basePrice")} placeholder="0.00" />
              {errors.basePrice && <p className="text-xs text-destructive">{errors.basePrice.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select onValueChange={(val) => setValue("categoryId", val)} defaultValue={watch("categoryId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
              <Label>Food Type</Label>
              <Select onValueChange={(val: any) => setValue("foodType", val)} defaultValue={watch("foodType")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Vegetarian</SelectItem>
                  <SelectItem value="non_veg">Non-Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="egg">Contains Egg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Spice Level (0-5)</Label>
              <Input type="number" min="0" max="5" {...register("spiceLevel")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-xs text-text-muted">Available for ordering</p>
              </div>
              <Switch checked={watch("isActive")} onCheckedChange={(val) => setValue("isActive", val)} />
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="space-y-0.5">
                <Label>Bestseller</Label>
                <p className="text-xs text-text-muted">Highlight in menu</p>
              </div>
              <Switch checked={watch("isBestseller")} onCheckedChange={(val) => setValue("isBestseller", val)} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {item ? "Update Item" : "Create Item"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}

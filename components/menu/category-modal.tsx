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
import { apiClient } from "@/lib/api-client";
import { Category } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  emoji: z.string().optional(),
  displayOrder: z.coerce.number().min(0),
  isActive: z.boolean().default(true),
});

type CategoryFormInput = z.input<typeof categorySchema>;
type CategoryFormValues = z.output<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: Category | null;
}

export function CategoryModal({ isOpen, onClose, onSuccess, category }: CategoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      emoji: "📁",
      displayOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        emoji: category.emoji || "📁",
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      });
    } else {
      reset({
        name: "",
        emoji: "📁",
        displayOrder: 0,
        isActive: true,
      });
    }
  }, [category, reset]);

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setIsSubmitting(true);
      if (category) {
        await apiClient.patch(`/menu/categories/${category.id}`, data);
        toast.success("Category updated successfully");
      } else {
        await apiClient.post("/menu/categories", data);
        toast.success("Category created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(category ? "Failed to update category" : "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{category ? "Edit Category" : "Add Category"}</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2 col-span-1">
              <Label>Emoji</Label>
              <Input {...register("emoji")} placeholder="📁" className="text-center text-xl" />
            </div>
            <div className="space-y-2 col-span-3">
              <Label>Name *</Label>
              <Input {...register("name")} placeholder="e.g. Main Course" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input type="number" {...register("displayOrder")} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
              <Label className="cursor-pointer">Active Status</Label>
              <Switch
                checked={watch("isActive")}
                onCheckedChange={(val) => setValue("isActive", val)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {category ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}

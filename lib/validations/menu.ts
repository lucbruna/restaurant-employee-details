import { z } from 'zod';

export const modifierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  priceDelta: z.number().default(0),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const modifierGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  selectionType: z.enum(['single', 'multiple']),
  minSelections: z.number().min(0).default(0),
  maxSelections: z.number().min(1).default(1),
  isRequired: z.boolean().default(false),
  modifiers: z.array(modifierSchema).optional(),
});

export const menuItemSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().max(500).optional(),
  shortCode: z.string().optional(),
  imageUrl: z
    .union([z.string().url(), z.string().startsWith('/'), z.literal('')])
    .optional()
    .nullable(),
  basePrice: z.number().min(0, 'Price must be positive'),
  foodType: z.enum(['veg', 'non_veg', 'vegan', 'egg']),
  taxCategoryId: z.string().optional(),
  isActive: z.boolean().default(true),
  isBestseller: z.boolean().default(false),
  isChefsSpecial: z.boolean().default(false),
  spiceLevel: z.number().min(0).max(5).default(0),
  prepTimeMinutes: z.number().min(0).default(15),
  tags: z.array(z.string()).default([]),
  modifierGroupIds: z.array(z.string()).default([]),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type ModifierGroupInput = z.infer<typeof modifierGroupSchema>;

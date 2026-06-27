const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  "cat-starters": "/menu/generic-starters.svg",
  "cat-mains": "/menu/generic-mains.svg",
  "cat-rice": "/menu/generic-rice.svg",
  "cat-breads": "/menu/generic-breads.svg",
  "cat-beverages": "/menu/generic-beverages.svg",
  "cat-desserts": "/menu/generic-desserts.svg",
  "cat-combos": "/menu/generic-combos.svg",
};

type CategoryWithImage = {
  id: string;
  imageUrl?: string | null;
};

function normalizeImageUrl(value?: string | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getDefaultCategoryImage(categoryId?: string | null) {
  if (!categoryId) {
    return null;
  }

  return DEFAULT_CATEGORY_IMAGES[categoryId] ?? null;
}

export function resolveCategoryImage(categoryId?: string | null, categoryImageUrl?: string | null) {
  return normalizeImageUrl(categoryImageUrl) ?? getDefaultCategoryImage(categoryId);
}

export function resolveMenuItemImage({
  itemImageUrl,
  categoryId,
  categoryImageUrl,
}: {
  itemImageUrl?: string | null;
  categoryId?: string | null;
  categoryImageUrl?: string | null;
}) {
  return normalizeImageUrl(itemImageUrl) ?? resolveCategoryImage(categoryId, categoryImageUrl);
}

export function buildCategoryImageMap<T extends CategoryWithImage>(categories: T[]) {
  return new Map(
    categories.map((category) => [
      category.id,
      resolveCategoryImage(category.id, category.imageUrl),
    ]),
  );
}


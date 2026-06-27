import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  menuCategories,
  menuItems,
  menuItemVariants,
  modifiers,
  outlets,
  tables,
} from '@/db/schema';
import {
  getTabletOrderingHref,
  isTabletOrderingEnabled,
  normalizeOutletSettings,
} from '@/lib/tablet-ordering';
import { resolveCategoryImage, resolveMenuItemImage } from '@/lib/menu-images';
import { createOrder, OrderCreationError } from '@/lib/orders/create-order';
import type {
  ModifierGroup,
  Table,
  TabletMenuCategory,
  TabletMenuItem,
  TabletOrderingBootstrap,
} from '@/types';

export const dynamic = 'force-dynamic';

const FOOD_TYPES = new Set(['veg', 'non_veg', 'vegan', 'egg']);

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function normalizeFoodType(value: unknown): TabletMenuItem['foodType'] {
  return typeof value === 'string' && FOOD_TYPES.has(value)
    ? (value as TabletMenuItem['foodType'])
    : 'veg';
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

async function getTabletContext(tableId: string) {
  const table = await db.query.tables.findFirst({
    where: eq(tables.id, tableId),
    with: {
      section: true,
    },
  });

  if (!table) {
    throw new OrderCreationError(404, 'This table could not be found.');
  }

  if (!table.outletId) {
    throw new OrderCreationError(409, `Table ${table.name} is not linked to an outlet yet.`);
  }

  const outlet = await db.query.outlets.findFirst({
    where: eq(outlets.id, table.outletId),
  });

  if (!outlet) {
    throw new OrderCreationError(404, 'This outlet could not be found.');
  }

  const settings = normalizeOutletSettings(outlet.settings);

  if (!isTabletOrderingEnabled(settings)) {
    throw new OrderCreationError(
      403,
      'Tablet and QR ordering are currently disabled for this outlet.',
    );
  }

  if (table.status === 'inactive' || table.status === 'dirty') {
    throw new OrderCreationError(
      409,
      `Table ${table.name} is not ready to receive orders right now.`,
    );
  }

  return { table, outlet, settings };
}

function mapModifierGroup(
  groupLink: {
    group: {
      id: string;
      name: string;
      minSelections: number | null;
      maxSelections: number | null;
      selectionType: string | null;
      isRequired: boolean | null;
      modifiers: Array<{
        id: string;
        name: string;
        priceDelta: number | null;
        isDefault: boolean | null;
        isActive: boolean | null;
      }>;
    } | null;
  },
): ModifierGroup | null {
  const group = groupLink.group;
  if (!group) {
    return null;
  }

  const selectionType = group.selectionType === 'multiple' ? 'multiple' : 'single';

  return {
    id: group.id,
    name: group.name,
    minSelections: group.minSelections ?? 0,
    maxSelections: group.maxSelections ?? (selectionType === 'multiple' ? 99 : 1),
    selectionType,
    isMultiple: selectionType === 'multiple',
    isRequired: Boolean(group.isRequired),
    modifiers: group.modifiers.map((modifier) => ({
      id: modifier.id,
      name: modifier.name,
      priceDelta: roundCurrency(toNumber(modifier.priceDelta)),
      isDefault: Boolean(modifier.isDefault),
      isActive: modifier.isActive ?? true,
    })),
  };
}

async function loadTabletBootstrap(tableId: string): Promise<TabletOrderingBootstrap> {
  const { table, outlet, settings } = await getTabletContext(tableId);

  const [categories, items] = await Promise.all([
    db.query.menuCategories.findMany({
      where: and(
        eq(menuCategories.outletId, outlet.id),
        eq(menuCategories.isActive, true),
      ),
      orderBy: (category, { asc }) => [asc(category.displayOrder), asc(category.name)],
    }),
    db.query.menuItems.findMany({
      where: and(eq(menuItems.outletId, outlet.id), eq(menuItems.isActive, true)),
      orderBy: (item, { asc }) => [asc(item.displayOrder), asc(item.name)],
      with: {
        variants: {
          where: eq(menuItemVariants.isActive, true),
          orderBy: (variant, { asc }) => [asc(variant.price), asc(variant.name)],
        },
        modifierGroups: {
          orderBy: (groupLink, { asc }) => [asc(groupLink.displayOrder)],
          with: {
            group: {
              with: {
                modifiers: {
                  where: eq(modifiers.isActive, true),
                  orderBy: (modifier, { asc }) => [
                    asc(modifier.displayOrder),
                    asc(modifier.name),
                  ],
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const mapMenuItem = (item: (typeof items)[number]): TabletMenuItem => ({
    id: item.id,
    categoryId: item.categoryId ?? '',
    name: item.name,
    description: item.description ?? undefined,
    shortCode: item.shortCode ?? undefined,
    imageUrl:
      resolveMenuItemImage({
        itemImageUrl: item.imageUrl,
        categoryId: item.categoryId,
      }) ?? undefined,
    basePrice: roundCurrency(toNumber(item.basePrice)),
    foodType: normalizeFoodType(item.foodType),
    taxCategoryId: item.taxCategoryId ?? undefined,
    isActive: item.isActive ?? true,
    isBestseller: Boolean(item.isBestseller),
    isChefsSpecial: Boolean(item.isChefsSpecial),
    spiceLevel: item.spiceLevel ?? 0,
    prepTimeMinutes: item.prepTimeMinutes ?? 15,
    tags: Array.isArray(item.tags)
      ? item.tags.filter((tag): tag is string => typeof tag === 'string')
      : [],
    variants: item.variants.map((variant) => ({
      id: variant.id,
      itemId: variant.itemId ?? undefined,
      name: variant.name,
      price: roundCurrency(toNumber(variant.price)),
      isActive: variant.isActive ?? true,
    })),
    modifierGroups: item.modifierGroups
      .map(mapModifierGroup)
      .filter((group): group is ModifierGroup => Boolean(group)),
  });

  const mappedItems = items.map(mapMenuItem);
  const itemsByCategory = new Map<string, TabletMenuItem[]>();

  mappedItems.forEach((item) => {
    const current = itemsByCategory.get(item.categoryId) ?? [];
    current.push(item);
    itemsByCategory.set(item.categoryId, current);
  });

  const mappedCategories: TabletMenuCategory[] = categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      emoji: category.emoji ?? null,
      imageUrl: resolveCategoryImage(category.id, category.imageUrl),
      items: itemsByCategory.get(category.id) ?? [],
    }))
    .filter((category) => category.items.length > 0);

  return {
    outlet: {
      id: outlet.id,
      name: outlet.name,
      logoUrl: outlet.logoUrl ?? null,
      currency: outlet.currency ?? 'INR',
    },
    table: {
      id: table.id,
      name: table.name,
      capacity: table.capacity ?? 1,
      status: (table.status ?? 'available') as Table['status'],
      sectionName: table.section?.name ?? null,
    },
    settings,
    categories: mappedCategories,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tableId = normalizeOptionalText(searchParams.get('tableId'));

    if (!tableId) {
      return NextResponse.json({ error: 'A tableId query parameter is required.' }, { status: 400 });
    }

    const bootstrap = await loadTabletBootstrap(tableId);
    return NextResponse.json(bootstrap);
  } catch (error) {
    if (error instanceof OrderCreationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('[TABLET_SESSION_GET]', error);
    return NextResponse.json(
      { error: 'Unable to load the ordering session right now.' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const tableId = normalizeOptionalText((body as Record<string, unknown>).tableId);

    if (!tableId) {
      return NextResponse.json({ error: 'A tableId is required to submit an order.' }, { status: 400 });
    }

    const { table, outlet } = await getTabletContext(tableId);
    const payload = body as Record<string, unknown>;

    const order = await createOrder({
      outletId: outlet.id,
      waiterId: null,
      payload: {
        tableId: table.id,
        orderType: 'dine_in',
        paxCount: payload.paxCount,
        specialInstructions: payload.specialInstructions,
        items: payload.items,
      },
    });

    return NextResponse.json(
      {
        order,
        table: {
          id: table.id,
          name: table.name,
          href: getTabletOrderingHref(table.id),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof OrderCreationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('[TABLET_SESSION_POST]', error);
    return NextResponse.json(
      { error: 'Unable to submit the order right now.' },
      { status: 500 },
    );
  }
}

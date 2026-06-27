"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Globe2,
  Loader2,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DishImage } from "@/components/menu/dish-image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StatePanel } from "@/components/ui/state-panel";
import { buildCategoryImageMap } from "@/lib/menu-images";
import { cn } from "@/lib/utils";
import { TABLET_LANGUAGE_OPTIONS } from "@/lib/tablet-ordering";
import type {
  OrderItemModifier,
  TabletLanguageCode,
  TabletMenuItem,
  TabletOrderingBootstrap,
} from "@/types";
import { toast } from "sonner";

type TabletOrderShellProps = {
  tableId: string;
};

type TabletCartItem = {
  id: string;
  itemId: string;
  itemName: string;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  modifiers: OrderItemModifier[];
  itemNote: string;
};

type SupportedTabletCopyLanguage = Extract<TabletLanguageCode, "en" | "hi">;

type TabletCopy = {
  welcomeEyebrow: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  searchPlaceholder: string;
  allCategories: string;
  orderSummary: string;
  yourTable: string;
  guests: string;
  emptyCartTitle: string;
  emptyCartBody: string;
  specialInstructions: string;
  specialInstructionsPlaceholder: string;
  taxesNotice: string;
  placeOrder: string;
  itemNotes: string;
  itemNotesPlaceholder: string;
  chooseVariant: string;
  customizeDish: string;
  addToCart: string;
  required: string;
  chooseUpTo: string;
  chooseOne: string;
  language: string;
  orderPlaced: string;
  orderFailed: string;
  subtotal: string;
  quantity: string;
  startOrdering: string;
  unavailable: string;
  retry: string;
};

const COPY: Record<SupportedTabletCopyLanguage, TabletCopy> = {
  en: {
    welcomeEyebrow: "Bhukkad Table Ordering",
    welcomeTitle: "Order directly from your table",
    welcomeSubtitle: "Browse the menu, customize dishes, and send your order straight to the kitchen.",
    searchPlaceholder: "Search for dishes, drinks, and combos",
    allCategories: "All",
    orderSummary: "Order summary",
    yourTable: "Your table",
    guests: "Guests",
    emptyCartTitle: "Your cart is empty",
    emptyCartBody: "Add a few dishes and they will appear here for final review.",
    specialInstructions: "Special instructions",
    specialInstructionsPlaceholder: "Anything the floor team should know about this order?",
    taxesNotice: "Taxes and outlet charges are applied at billing for the most accurate final total.",
    placeOrder: "Place order",
    itemNotes: "Notes for this dish",
    itemNotesPlaceholder: "No onion, extra spicy, sauce on the side...",
    chooseVariant: "Choose a size or portion",
    customizeDish: "Customize your dish",
    addToCart: "Add to cart",
    required: "Required",
    chooseUpTo: "Choose up to",
    chooseOne: "Choose one",
    language: "Language",
    orderPlaced: "Your order has been sent to the kitchen.",
    orderFailed: "We could not place the order right now.",
    subtotal: "Subtotal",
    quantity: "Quantity",
    startOrdering: "Start your table order",
    unavailable: "This ordering session is unavailable right now.",
    retry: "Retry",
  },
  hi: {
    welcomeEyebrow: "भुक्कड़ टेबल ऑर्डरिंग",
    welcomeTitle: "अपनी टेबल से सीधे ऑर्डर करें",
    welcomeSubtitle: "मेन्यू देखें, डिश कस्टमाइज़ करें और ऑर्डर सीधे किचन तक भेजें।",
    searchPlaceholder: "डिश, ड्रिंक या कॉम्बो खोजें",
    allCategories: "सभी",
    orderSummary: "ऑर्डर सारांश",
    yourTable: "आपकी टेबल",
    guests: "मेहमान",
    emptyCartTitle: "आपकी कार्ट खाली है",
    emptyCartBody: "कुछ डिश जोड़ें, फिर वे यहाँ अंतिम समीक्षा के लिए दिखेंगी।",
    specialInstructions: "विशेष निर्देश",
    specialInstructionsPlaceholder: "क्या इस ऑर्डर के बारे में फ्लोर टीम को कुछ और जानना चाहिए?",
    taxesNotice: "अंतिम बिल की सही राशि के लिए टैक्स और आउटलेट चार्ज बिलिंग के समय जोड़े जाते हैं।",
    placeOrder: "ऑर्डर भेजें",
    itemNotes: "इस डिश के लिए नोट्स",
    itemNotesPlaceholder: "प्याज नहीं, ज्यादा मसालेदार, सॉस अलग से...",
    chooseVariant: "साइज़ या पोर्शन चुनें",
    customizeDish: "अपनी डिश कस्टमाइज़ करें",
    addToCart: "कार्ट में जोड़ें",
    required: "ज़रूरी",
    chooseUpTo: "अधिकतम चुनें",
    chooseOne: "एक चुनें",
    language: "भाषा",
    orderPlaced: "आपका ऑर्डर किचन को भेज दिया गया है।",
    orderFailed: "अभी ऑर्डर नहीं भेजा जा सका।",
    subtotal: "उप-योग",
    quantity: "मात्रा",
    startOrdering: "अपना टेबल ऑर्डर शुरू करें",
    unavailable: "यह ऑर्डरिंग सत्र अभी उपलब्ध नहीं है।",
    retry: "फिर से प्रयास करें",
  },
};

function resolveTabletCopyLanguage(language: TabletLanguageCode): SupportedTabletCopyLanguage {
  return language === "hi" ? "hi" : "en";
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function buildDefaultSelections(item: TabletMenuItem | null) {
  if (!item) return {} as Record<string, string[]>;

  return (item.modifierGroups ?? []).reduce<Record<string, string[]>>((acc, group) => {
    const defaults = group.modifiers
      .filter((modifier) => modifier.isDefault)
      .map((modifier) => modifier.id);

    if (defaults.length > 0) {
      acc[group.id] = defaults;
    }

    return acc;
  }, {});
}

function isMultipleSelectionGroup(
  group: NonNullable<TabletMenuItem["modifierGroups"]>[number],
) {
  if (typeof group.isMultiple === "boolean") return group.isMultiple;
  return group.selectionType === "multiple";
}

function foodTypeLabel(foodType: TabletMenuItem["foodType"], language: TabletLanguageCode) {
  const labels: Record<SupportedTabletCopyLanguage, Record<TabletMenuItem["foodType"], string>> = {
    en: {
      veg: "Veg",
      non_veg: "Non-Veg",
      vegan: "Vegan",
      egg: "Egg",
    },
    hi: {
      veg: "शाकाहारी",
      non_veg: "नॉन-वेज",
      vegan: "वीगन",
      egg: "अंडा",
    },
  };

  const copyLanguage = resolveTabletCopyLanguage(language);
  return labels[copyLanguage][foodType] ?? labels[copyLanguage].veg;
}

export function TabletOrderShell({ tableId }: TabletOrderShellProps) {
  const [bootstrap, setBootstrap] = useState<TabletOrderingBootstrap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<TabletLanguageCode>("en");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [cart, setCart] = useState<TabletCartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TabletMenuItem | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  const [itemNote, setItemNote] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [paxCount, setPaxCount] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null);

  const copy = COPY[resolveTabletCopyLanguage(activeLanguage)];
  const categoryImageMap = useMemo(
    () => buildCategoryImageMap(bootstrap?.categories ?? []),
    [bootstrap?.categories],
  );

  const loadBootstrap = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tablet/session?tableId=${encodeURIComponent(tableId)}`, {
        cache: "no-store",
      });
      const data = (await response.json().catch(() => null)) as
        | TabletOrderingBootstrap
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(data && "error" in data && data.error ? data.error : COPY.en.unavailable);
      }

      const bootstrapData = data as TabletOrderingBootstrap;
      setBootstrap(bootstrapData);
      setActiveLanguage((current) =>
        current === "en" || current === "hi"
          ? current
          : bootstrapData.settings.defaultTabletLanguage,
      );
      setSelectedCategoryId((current) =>
        current === "all" || bootstrapData.categories.some((category) => category.id === current)
          ? current
          : (bootstrapData.categories[0]?.id ?? "all"),
      );
      setPaxCount((current) => Math.max(1, Math.min(bootstrapData.table.capacity, current || 1)));
    } catch (err) {
      setError(err instanceof Error ? err.message : COPY.en.unavailable);
    } finally {
      setIsLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    void loadBootstrap();
  }, [loadBootstrap]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(activeLanguage === "hi" ? "hi-IN" : "en-IN", {
      style: "currency",
      currency: bootstrap?.outlet.currency ?? "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const searchedCategories =
    bootstrap?.categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          if (!searchTerm.trim()) return true;

          const haystack = [
            item.name,
            item.description ?? "",
            ...(item.tags ?? []),
          ]
            .join(" ")
            .toLowerCase();

          return haystack.includes(searchTerm.trim().toLowerCase());
        }),
      }))
      .filter((category) => category.items.length > 0) ?? [];

  const visibleCategories =
    selectedCategoryId === "all"
      ? searchedCategories
      : searchedCategories.filter((category) => category.id === selectedCategoryId);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = roundCurrency(cart.reduce((sum, item) => sum + item.itemTotal, 0));

  const selectedVariant =
    selectedItem?.variants?.find((variant) => variant.id === selectedVariantId) ?? null;

  const selectedModifierSummary =
    selectedItem?.modifierGroups?.flatMap((group) => {
      const modifierIds = selectedModifiers[group.id] ?? [];
      return group.modifiers
        .filter((modifier) => modifierIds.includes(modifier.id))
        .map<OrderItemModifier>((modifier) => ({
          id: modifier.id,
          name: modifier.name,
          groupId: group.id,
          modifierId: modifier.id,
          modifierName: modifier.name,
          priceDelta: roundCurrency(modifier.priceDelta),
        }));
    }) ?? [];

  const selectedItemUnitPrice = roundCurrency(
    (selectedVariant?.price ?? selectedItem?.basePrice ?? 0) +
      selectedModifierSummary.reduce((sum, modifier) => sum + modifier.priceDelta, 0),
  );

  const selectedItemTotal = roundCurrency(selectedItemUnitPrice * itemQuantity);

  const isSelectionValid =
    selectedItem?.modifierGroups?.every((group) => {
      if (!group.isRequired) return true;
      return (selectedModifiers[group.id] ?? []).length >= Math.max(1, group.minSelections);
    }) ?? true;

  function openItem(item: TabletMenuItem) {
    setSelectedItem(item);
    setSelectedVariantId(item.variants?.[0]?.id ?? null);
    setSelectedModifiers(buildDefaultSelections(item));
    setItemNote("");
    setItemQuantity(1);
  }

  function closeItemDialog() {
    setSelectedItem(null);
    setSelectedVariantId(null);
    setSelectedModifiers({});
    setItemNote("");
    setItemQuantity(1);
  }

  function toggleModifier(
    groupId: string,
    modifierId: string,
    isMultiple: boolean,
    maxSelections: number,
  ) {
    setSelectedModifiers((current) => {
      const selected = current[groupId] ?? [];
      const isSelected = selected.includes(modifierId);

      if (isSelected) {
        return {
          ...current,
          [groupId]: selected.filter((id) => id !== modifierId),
        };
      }

      if (!isMultiple) {
        return {
          ...current,
          [groupId]: [modifierId],
        };
      }

      if (selected.length >= maxSelections) {
        return current;
      }

      return {
        ...current,
        [groupId]: [...selected, modifierId],
      };
    });
  }

  function addSelectedItemToCart() {
    if (!selectedItem || !isSelectionValid) return;

    const cartLine: TabletCartItem = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      variantId: selectedVariant?.id ?? null,
      variantName: selectedVariant?.name ?? null,
      quantity: itemQuantity,
      unitPrice: selectedItemUnitPrice,
      itemTotal: selectedItemTotal,
      modifiers: selectedModifierSummary,
      itemNote: itemNote.trim(),
    };

    setCart((current) => [...current, cartLine]);
    closeItemDialog();
    toast.success(`${selectedItem.name} ${copy.addToCart.toLowerCase()}`);
  }

  function updateCartQuantity(cartItemId: string, nextQuantity: number) {
    setCart((current) =>
      current.flatMap((item) => {
        if (item.id !== cartItemId) return [item];
        if (nextQuantity <= 0) return [];

        return [
          {
            ...item,
            quantity: nextQuantity,
            itemTotal: roundCurrency(item.unitPrice * nextQuantity),
          },
        ];
      }),
    );
  }

  function removeCartItem(cartItemId: string) {
    setCart((current) => current.filter((item) => item.id !== cartItemId));
  }

  async function submitOrder() {
    if (!bootstrap || cart.length === 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/tablet/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId,
          paxCount,
          specialInstructions,
          items: cart.map((item) => ({
            itemId: item.itemId,
            variantId: item.variantId,
            quantity: item.quantity,
            modifiers: item.modifiers,
            itemNote: item.itemNote,
          })),
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; order?: { orderNumber?: string } }
        | null;

      if (!response.ok) {
        throw new Error(data?.error || copy.orderFailed);
      }

      setLastOrderNumber(data?.order?.orderNumber ?? null);
      setCart([]);
      setSpecialInstructions("");
      toast.success(
        data?.order?.orderNumber
          ? `${copy.orderPlaced} #${data.order.orderNumber}`
          : copy.orderPlaced,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : copy.orderFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5ef] px-6 py-10 text-slate-900">
        <StatePanel
          tone="loading"
          eyebrow={COPY.en.welcomeEyebrow}
          title={COPY.en.startOrdering}
          description="We’re preparing the live table menu, pricing, and outlet settings for this ordering session."
          className="w-full max-w-3xl"
        />
      </div>
    );
  }

  if (!bootstrap || error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5ef] px-6 py-10 text-slate-900">
        <StatePanel
          tone="error"
          eyebrow={copy.welcomeEyebrow}
          title={copy.unavailable}
          description={
            error ??
            "Please ask a team member for help, or retry in a moment if the table was just enabled for ordering."
          }
          className="w-full max-w-3xl"
          primaryAction={{
            label: copy.retry,
            onClick: () => {
              void loadBootstrap();
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef] text-slate-900">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-4 md:px-6 md:py-6 xl:flex-row">
        <main className="min-w-0 flex-1 space-y-6">
          <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.16),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.12),_transparent_35%),linear-gradient(135deg,#ffffff,_#fff8ef)] p-6 md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                    <UtensilsCrossed className="h-3.5 w-3.5" />
                    {copy.welcomeEyebrow}
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                      {copy.welcomeTitle}
                    </h1>
                    <p className="max-w-2xl text-sm font-medium leading-7 text-slate-600 md:text-base">
                      {copy.welcomeSubtitle}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
                    <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2">
                      {copy.yourTable}:{" "}
                      <span className="text-slate-950">
                        {bootstrap.table.name}
                        {bootstrap.table.sectionName ? ` · ${bootstrap.table.sectionName}` : ""}
                      </span>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2">
                      {copy.guests}: <span className="text-slate-950">{paxCount}</span>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2">
                      {copy.language}:{" "}
                      <span className="text-slate-950">
                        {TABLET_LANGUAGE_OPTIONS.find((option) => option.code === activeLanguage)?.nativeLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white/85 p-4 backdrop-blur">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {copy.language}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TABLET_LANGUAGE_OPTIONS.map((option) => (
                      <Button
                        key={option.code}
                        type="button"
                        variant={activeLanguage === option.code ? "default" : "outline"}
                        className="rounded-full"
                        onClick={() => setActiveLanguage(option.code)}
                      >
                        <Globe2 className="mr-2 h-4 w-4" />
                        {option.nativeLabel}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {lastOrderNumber ? (
                <div className="mt-6 flex items-center gap-3 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  {copy.orderPlaced} #{lastOrderNumber}
                </div>
              ) : null}
            </div>
          </section>

          <section className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 text-sm font-medium"
                />
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                <span className="text-sm font-semibold text-slate-500">{copy.guests}</span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setPaxCount((current) => Math.max(1, current - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-6 text-center text-sm font-black text-slate-950">
                    {paxCount}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                    onClick={() =>
                      setPaxCount((current) =>
                        Math.min(bootstrap.table.capacity, current + 1),
                      )
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={selectedCategoryId === "all" ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setSelectedCategoryId("all")}
              >
                {copy.allCategories}
              </Button>
              {bootstrap.categories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  variant={selectedCategoryId === category.id ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  <span className="mr-2">{category.emoji ?? "🍽️"}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </section>

          <div className="space-y-8">
            {visibleCategories.map((category) => (
              <section key={category.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-2xl shadow-sm">
                    {category.emoji ?? "🍽️"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                      {category.name}
                    </h2>
                    <p className="text-sm font-medium text-slate-500">
                      {category.items.length} items available
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {category.items.map((item) => {
                    const startingPrice =
                      item.variants && item.variants.length > 0
                        ? Math.min(...item.variants.map((variant) => variant.price))
                        : item.basePrice;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openItem(item)}
                        className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                      >
                        <div className="flex h-full flex-col">
                          <div className="relative h-44">
                            <DishImage
                              imageUrl={item.imageUrl}
                              fallbackImageUrl={categoryImageMap.get(item.categoryId) ?? null}
                              alt={item.name}
                              className="h-full w-full"
                              fallbackClassName="bg-[linear-gradient(135deg,rgba(250,204,21,0.22),rgba(249,115,22,0.12))]"
                            />
                            <div className="absolute left-5 top-5 rounded-full border border-white/80 bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-primary shadow-sm">
                              {foodTypeLabel(item.foodType, activeLanguage)}
                            </div>
                            {item.isBestseller || item.isChefsSpecial ? (
                              <div className="absolute right-5 top-5 rounded-full border border-white/80 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                                {item.isChefsSpecial ? "Chef's pick" : "Popular"}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex flex-1 flex-col gap-4 p-5">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                                    {item.name}
                                  </h3>
                                  <p className="mt-1 text-sm font-medium text-slate-500">
                                    {foodTypeLabel(item.foodType, activeLanguage)}
                                  </p>
                                </div>
                                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-black text-slate-950">
                                  {formatCurrency(startingPrice)}
                                </div>
                              </div>

                              {item.description ? (
                                <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                                  {item.description}
                                </p>
                              ) : null}
                            </div>

                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                                {item.variants && item.variants.length > 0 ? (
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                                    {item.variants.length} sizes
                                  </span>
                                ) : null}
                                {item.modifierGroups && item.modifierGroups.length > 0 ? (
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                                    Customizable
                                  </span>
                                ) : null}
                              </div>
                              <span className="text-sm font-black text-primary transition group-hover:translate-x-1">
                                {copy.addToCart}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}

            {visibleCategories.length === 0 ? (
              <div className="rounded-[32px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  No matching dishes were found for this search.
                </p>
              </div>
            ) : null}
          </div>
        </main>

        <aside className="w-full xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:w-[390px]">
          <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                    <ShoppingCart className="h-4 w-4" />
                    {copy.orderSummary}
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {bootstrap.table.name}
                  </h2>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-black text-slate-950">
                  {cartItemCount}
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-5 px-5 py-5">
                {cart.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                    <p className="text-lg font-semibold text-slate-900">{copy.emptyCartTitle}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {copy.emptyCartBody}
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[28px] border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-slate-950">{item.itemName}</p>
                          {item.variantName ? (
                            <p className="text-sm font-medium text-slate-500">
                              {item.variantName}
                            </p>
                          ) : null}
                          {item.modifiers.length > 0 ? (
                            <p className="text-sm leading-6 text-slate-500">
                              {item.modifiers.map((modifier) => modifier.modifierName).join(", ")}
                            </p>
                          ) : null}
                          {item.itemNote ? (
                            <p className="text-sm leading-6 text-slate-500">“{item.itemNote}”</p>
                          ) : null}
                        </div>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full text-slate-500 hover:text-destructive"
                          onClick={() => removeCartItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-6 text-center text-sm font-black text-slate-950">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <p className="text-sm font-black text-slate-950">
                          {formatCurrency(item.itemTotal)}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                  <label
                    htmlFor="tablet-order-special-instructions"
                    className="text-sm font-semibold text-slate-900"
                  >
                    {copy.specialInstructions}
                  </label>
                  <textarea
                    id="tablet-order-special-instructions"
                    value={specialInstructions}
                    onChange={(event) => setSpecialInstructions(event.target.value)}
                    placeholder={copy.specialInstructionsPlaceholder}
                    className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-primary/40"
                  />
                </div>
              </div>
            </ScrollArea>

            <div className="border-t border-slate-200 px-5 py-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-base font-semibold text-slate-600">
                  <span>{copy.subtotal}</span>
                  <span className="text-xl font-black text-slate-950">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <Separator />
                <p className="text-sm leading-6 text-slate-500">{copy.taxesNotice}</p>
                <Button
                  className="h-12 w-full rounded-2xl text-base font-black"
                  disabled={cart.length === 0 || isSubmitting}
                  onClick={submitOrder}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="mr-2 h-4 w-4" />
                  )}
                  {copy.placeOrder}
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => !open && closeItemDialog()}>
        <DialogContent className="max-w-3xl rounded-[32px] border-slate-200 p-0">
          {selectedItem ? (
            <div className="overflow-hidden">
              <DialogHeader className="border-b border-slate-200 bg-[linear-gradient(135deg,rgba(250,204,21,0.16),rgba(249,115,22,0.08))] px-6 py-6">
                <DialogTitle className="text-3xl font-semibold tracking-tight text-slate-950">
                  {selectedItem.name}
                </DialogTitle>
                <DialogDescription className="max-w-2xl text-sm leading-6 text-slate-600">
                  {selectedItem.description || copy.customizeDish}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6 px-6 py-6">
                  {selectedItem.variants && selectedItem.variants.length > 0 ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-base font-semibold text-slate-950">
                          {copy.chooseVariant}
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {selectedItem.variants.map((variant) => (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => setSelectedVariantId(variant.id)}
                            className={cn(
                              "rounded-[24px] border p-4 text-left transition",
                              selectedVariantId === variant.id
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-slate-200 bg-slate-50 hover:border-primary/30",
                            )}
                          >
                            <p className="text-base font-semibold text-slate-950">{variant.name}</p>
                            <p className="mt-1 text-sm font-black text-slate-700">
                              {formatCurrency(variant.price)}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {(selectedItem.modifierGroups ?? []).map((group) => {
                    const selectedCount = (selectedModifiers[group.id] ?? []).length;
                    const isMultiple = isMultipleSelectionGroup(group);
                    const maxSelections = Math.max(1, group.maxSelections ?? 1);

                    return (
                      <div key={group.id} className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-base font-semibold text-slate-950">{group.name}</p>
                          {group.isRequired ? (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-amber-700">
                              {copy.required}
                            </span>
                          ) : null}
                          <span className="text-sm font-medium text-slate-500">
                            {isMultiple
                              ? `${copy.chooseUpTo} ${maxSelections}`
                              : copy.chooseOne}
                          </span>
                        </div>

                        <div className="grid gap-3">
                          {group.modifiers.map((modifier) => {
                            const isSelected = (selectedModifiers[group.id] ?? []).includes(
                              modifier.id,
                            );
                            const isDisabled = Boolean(
                              !isSelected && isMultiple && selectedCount >= maxSelections,
                            );

                            return (
                              <button
                                key={modifier.id}
                                type="button"
                                disabled={isDisabled}
                                onClick={() =>
                                  toggleModifier(
                                    group.id,
                                    modifier.id,
                                    isMultiple,
                                    maxSelections,
                                  )
                                }
                                className={cn(
                                  "flex items-center justify-between rounded-[22px] border p-4 text-left transition",
                                  isSelected
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-slate-200 bg-slate-50 hover:border-primary/30",
                                  isDisabled && "cursor-not-allowed opacity-50",
                                )}
                              >
                                <div className="space-y-1">
                                  <p className="text-base font-semibold text-slate-950">
                                    {modifier.name}
                                  </p>
                                  <p className="text-sm font-medium text-slate-500">
                                    {modifier.priceDelta > 0
                                      ? `+ ${formatCurrency(modifier.priceDelta)}`
                                      : formatCurrency(0)}
                                  </p>
                                </div>
                                <div
                                  className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-black",
                                    isSelected
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-slate-300 bg-white text-slate-500",
                                  )}
                                >
                                  {isSelected ? "✓" : "+"}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <div className="space-y-3">
                    <label
                      htmlFor="tablet-item-note"
                      className="text-base font-semibold text-slate-950"
                    >
                      {copy.itemNotes}
                    </label>
                    <textarea
                      id="tablet-item-note"
                      value={itemNote}
                      onChange={(event) => setItemNote(event.target.value)}
                      placeholder={copy.itemNotesPlaceholder}
                      className="min-h-28 w-full resize-none rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-primary/40"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-slate-50 px-6 py-6 lg:border-l lg:border-t-0">
                  <div className="space-y-6">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-sm font-semibold text-slate-500">{copy.quantity}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-10 w-10 rounded-full"
                          onClick={() => setItemQuantity((current) => Math.max(1, current - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-3xl font-black text-slate-950">{itemQuantity}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-10 w-10 rounded-full"
                          onClick={() => setItemQuantity((current) => current + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-sm font-semibold text-slate-500">{copy.subtotal}</p>
                      <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                        {formatCurrency(selectedItemTotal)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {copy.taxesNotice}
                      </p>
                    </div>

                    <Button
                      className="h-12 w-full rounded-2xl text-base font-black"
                      disabled={!isSelectionValid}
                      onClick={addSelectedItemToCart}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {copy.addToCart}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

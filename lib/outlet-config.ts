import type {
  DeliveryPartnerCode,
  DeliveryPartnerCompatibility,
  OutletBusinessType,
  PaymentMethodCode,
  PaymentProviderCode,
  PaymentProviderMode,
  PaymentProviderSettings,
  TabletLanguageCode,
  TabletOrderingSettings,
} from '@/types';

type JsonRecord = Record<string, unknown>;

const DEFAULT_LANGUAGE: TabletLanguageCode = 'en';
const DEFAULT_BUSINESS_TYPE: OutletBusinessType = 'restaurant';
const DEFAULT_SERVICE_MODES: TabletOrderingSettings['serviceModes'] = [
  'dine_in',
  'takeaway',
  'delivery',
  'online',
];

export const TABLET_LANGUAGE_OPTIONS: Array<{
  code: TabletLanguageCode;
  label: string;
  nativeLabel: string;
}> = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
];

export const TABLET_LANGUAGE_LABELS: Record<TabletLanguageCode, string> = {
  en: 'English',
  hi: 'हिन्दी',
  bn: 'বাংলা',
  mr: 'मराठी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  pa: 'ਪੰਜਾਬੀ',
};

const DELIVERY_PARTNER_OPTIONS: DeliveryPartnerCode[] = [
  'swiggy',
  'zomato',
  'ondc',
  'uber_eats',
  'deliveroo',
  'kareems',
];

const PAYMENT_PROVIDER_OPTIONS: PaymentProviderCode[] = ['manual', 'stripe', 'razorpay'];

const DEFAULT_DELIVERY_PARTNER_COMPATIBILITY: Record<
  DeliveryPartnerCode,
  DeliveryPartnerCompatibility
> = {
  swiggy: {
    enabled: false,
    orderInjectionMode: 'manual',
    supportsMenuSync: false,
    supportsOrderPush: false,
    supportsStatusSync: false,
    supportsStoreHoursSync: false,
    notes: 'Ready for Swiggy bridge or aggregator middleware.',
  },
  zomato: {
    enabled: false,
    orderInjectionMode: 'manual',
    supportsMenuSync: false,
    supportsOrderPush: false,
    supportsStatusSync: false,
    supportsStoreHoursSync: false,
    notes: 'Aligned for Zomato restaurant integration contracts.',
  },
  ondc: {
    enabled: false,
    orderInjectionMode: 'manual',
    supportsMenuSync: false,
    supportsOrderPush: false,
    supportsStatusSync: false,
    supportsStoreHoursSync: false,
    notes: 'Prepared for ONDC-compatible buyer and seller app mediation.',
  },
  uber_eats: {
    enabled: false,
    orderInjectionMode: 'manual',
    supportsMenuSync: false,
    supportsOrderPush: false,
    supportsStatusSync: false,
    supportsStoreHoursSync: false,
    notes: 'Foreign delivery compatibility placeholder.',
  },
  deliveroo: {
    enabled: false,
    orderInjectionMode: 'manual',
    supportsMenuSync: false,
    supportsOrderPush: false,
    supportsStatusSync: false,
    supportsStoreHoursSync: false,
    notes: 'Foreign delivery compatibility placeholder.',
  },
  kareems: {
    enabled: false,
    orderInjectionMode: 'manual',
    supportsMenuSync: false,
    supportsOrderPush: false,
    supportsStatusSync: false,
    supportsStoreHoursSync: false,
    notes: 'Brand-owned delivery compatibility placeholder.',
  },
};

const DEFAULT_PAYMENT_PROVIDER_SETTINGS: Record<PaymentProviderCode, PaymentProviderSettings> = {
  manual: {
    enabled: true,
    mode: 'sandbox',
    displayName: 'Manual POS Settlement',
    supportedMethods: ['cash', 'card', 'upi', 'wallet', 'complimentary'],
  },
  stripe: {
    enabled: false,
    mode: 'sandbox',
    displayName: 'Stripe',
    supportedMethods: ['card', 'wallet'],
    publishableKey: null,
  },
  razorpay: {
    enabled: false,
    mode: 'sandbox',
    displayName: 'Razorpay',
    supportedMethods: ['card', 'upi', 'wallet'],
    keyId: null,
  },
};

export const DEFAULT_OUTLET_SETTINGS: TabletOrderingSettings = {
  taxRate: 5,
  serviceCharge: 0,
  applyTaxOnServiceCharge: false,
  roundOffStrategy: 'none',
  printReceiptAutomatically: true,
  enableKDS: true,
  enableOnlineOrders: false,
  enableTabletOrdering: false,
  enableQrOrdering: false,
  enableReservations: true,
  enableTokenQueue: false,
  defaultTabletLanguage: DEFAULT_LANGUAGE,
  supportedTabletLanguages: [DEFAULT_LANGUAGE, 'hi'],
  businessType: DEFAULT_BUSINESS_TYPE,
  serviceModes: [...DEFAULT_SERVICE_MODES],
  payments: {
    defaultProvider: 'manual',
    providers: {
      manual: { ...DEFAULT_PAYMENT_PROVIDER_SETTINGS.manual },
      stripe: { ...DEFAULT_PAYMENT_PROVIDER_SETTINGS.stripe },
      razorpay: { ...DEFAULT_PAYMENT_PROVIDER_SETTINGS.razorpay },
    },
  },
  integrations: DEFAULT_DELIVERY_PARTNER_COMPATIBILITY,
};

const toRecord = (value: unknown): JsonRecord =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? { ...(value as JsonRecord) }
    : {};

const toNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: unknown, fallback: boolean) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
};

const unique = <T>(values: T[]) => Array.from(new Set(values));

function normalizePaymentMethodList(
  value: unknown,
  fallbackMethods: PaymentMethodCode[],
): PaymentMethodCode[] {
  const candidates = Array.isArray(value) ? value : [];
  const normalized = unique(
    candidates.filter(
      (candidate): candidate is PaymentMethodCode =>
        candidate === 'cash' ||
        candidate === 'card' ||
        candidate === 'upi' ||
        candidate === 'wallet' ||
        candidate === 'complimentary',
    ),
  );

  return normalized.length > 0 ? normalized : [...fallbackMethods];
}

export function normalizeTabletLanguage(value: unknown): TabletLanguageCode {
  return TABLET_LANGUAGE_OPTIONS.some((option) => option.code === value)
    ? (value as TabletLanguageCode)
    : DEFAULT_LANGUAGE;
}

export function getTabletLanguageLabel(language: unknown) {
  return TABLET_LANGUAGE_LABELS[normalizeTabletLanguage(language)];
}

export function normalizeTabletLanguageList(value: unknown): TabletLanguageCode[] {
  const candidates = Array.isArray(value) ? value : [];
  const normalized = unique(candidates.map((candidate) => normalizeTabletLanguage(candidate)));

  if (normalized.length === 0) {
    return [...DEFAULT_OUTLET_SETTINGS.supportedTabletLanguages];
  }

  if (!normalized.includes(DEFAULT_LANGUAGE)) {
    normalized.unshift(DEFAULT_LANGUAGE);
  }

  return normalized;
}

function normalizeBusinessType(value: unknown): OutletBusinessType {
  switch (value) {
    case 'cafe':
    case 'hotel':
    case 'cloud_kitchen':
    case 'sweet_shop':
    case 'bakery':
      return value;
    default:
      return DEFAULT_BUSINESS_TYPE;
  }
}

function normalizeRoundOffStrategy(
  value: unknown,
): TabletOrderingSettings['roundOffStrategy'] {
  return value === 'nearest_rupee' ? 'nearest_rupee' : 'none';
}

function normalizeServiceModes(value: unknown): TabletOrderingSettings['serviceModes'] {
  const candidates = Array.isArray(value) ? value : [];
  const normalized = unique(
    candidates.filter(
      (candidate): candidate is TabletOrderingSettings['serviceModes'][number] =>
        candidate === 'dine_in' ||
        candidate === 'takeaway' ||
        candidate === 'delivery' ||
        candidate === 'online',
    ),
  );

  return normalized.length > 0 ? normalized : [...DEFAULT_SERVICE_MODES];
}

function normalizePaymentProviderMode(value: unknown): PaymentProviderMode {
  return value === 'live' ? 'live' : 'sandbox';
}

function normalizePaymentProviderSettings(
  provider: PaymentProviderCode,
  value: unknown,
): PaymentProviderSettings {
  const current = toRecord(value);
  const fallback = DEFAULT_PAYMENT_PROVIDER_SETTINGS[provider];

  return {
    enabled: toBoolean(current.enabled, fallback.enabled),
    mode: normalizePaymentProviderMode(current.mode ?? fallback.mode),
    displayName:
      typeof current.displayName === 'string' && current.displayName.trim().length > 0
        ? current.displayName.trim()
        : fallback.displayName,
    supportedMethods: normalizePaymentMethodList(
      current.supportedMethods ?? fallback.supportedMethods,
      fallback.supportedMethods,
    ),
    publishableKey:
      typeof current.publishableKey === 'string'
        ? current.publishableKey.trim() || null
        : fallback.publishableKey ?? null,
    keyId:
      typeof current.keyId === 'string' ? current.keyId.trim() || null : fallback.keyId ?? null,
  };
}

function normalizePaymentSettings(value: unknown): TabletOrderingSettings['payments'] {
  const current = toRecord(value);
  const providers = toRecord(current.providers);

  const normalizedProviders = PAYMENT_PROVIDER_OPTIONS.reduce(
    (acc, provider) => {
      acc[provider] = normalizePaymentProviderSettings(provider, providers[provider]);
      return acc;
    },
    {} as TabletOrderingSettings['payments']['providers'],
  );

  const defaultProvider =
    current.defaultProvider && PAYMENT_PROVIDER_OPTIONS.includes(current.defaultProvider as PaymentProviderCode)
      ? (current.defaultProvider as PaymentProviderCode)
      : DEFAULT_OUTLET_SETTINGS.payments.defaultProvider;

  return {
    defaultProvider,
    providers: normalizedProviders,
  };
}

function normalizeDeliveryPartnerCompatibility(
  partner: DeliveryPartnerCode,
  value: unknown,
): DeliveryPartnerCompatibility {
  const current = toRecord(value);
  const fallback = DEFAULT_DELIVERY_PARTNER_COMPATIBILITY[partner];

  return {
    enabled: toBoolean(current.enabled, fallback.enabled),
    orderInjectionMode:
      current.orderInjectionMode === 'api' || current.orderInjectionMode === 'aggregator'
        ? current.orderInjectionMode
        : fallback.orderInjectionMode,
    supportsMenuSync: toBoolean(current.supportsMenuSync, fallback.supportsMenuSync),
    supportsOrderPush: toBoolean(current.supportsOrderPush, fallback.supportsOrderPush),
    supportsStatusSync: toBoolean(current.supportsStatusSync, fallback.supportsStatusSync),
    supportsStoreHoursSync: toBoolean(
      current.supportsStoreHoursSync,
      fallback.supportsStoreHoursSync,
    ),
    notes:
      typeof current.notes === 'string' && current.notes.trim().length > 0
        ? current.notes.trim()
        : fallback.notes,
  };
}

function normalizeIntegrations(
  value: unknown,
): TabletOrderingSettings['integrations'] {
  const current = toRecord(value);

  return DELIVERY_PARTNER_OPTIONS.reduce(
    (acc, partner) => {
      acc[partner] = normalizeDeliveryPartnerCompatibility(partner, current[partner]);
      return acc;
    },
    {} as TabletOrderingSettings['integrations'],
  );
}

export function normalizeOutletSettings(
  value: unknown,
): JsonRecord & TabletOrderingSettings {
  const current = toRecord(value);
  const supportedTabletLanguages = normalizeTabletLanguageList(current.supportedTabletLanguages);
  const defaultTabletLanguage = normalizeTabletLanguage(current.defaultTabletLanguage);

  return {
    ...current,
    taxRate: toNumber(current.taxRate, DEFAULT_OUTLET_SETTINGS.taxRate),
    serviceCharge: toNumber(current.serviceCharge, DEFAULT_OUTLET_SETTINGS.serviceCharge),
    applyTaxOnServiceCharge: toBoolean(
      current.applyTaxOnServiceCharge,
      DEFAULT_OUTLET_SETTINGS.applyTaxOnServiceCharge,
    ),
    roundOffStrategy: normalizeRoundOffStrategy(current.roundOffStrategy),
    printReceiptAutomatically: toBoolean(
      current.printReceiptAutomatically,
      DEFAULT_OUTLET_SETTINGS.printReceiptAutomatically,
    ),
    enableKDS: toBoolean(current.enableKDS, DEFAULT_OUTLET_SETTINGS.enableKDS),
    enableOnlineOrders: toBoolean(
      current.enableOnlineOrders,
      DEFAULT_OUTLET_SETTINGS.enableOnlineOrders,
    ),
    enableTabletOrdering: toBoolean(
      current.enableTabletOrdering,
      DEFAULT_OUTLET_SETTINGS.enableTabletOrdering,
    ),
    enableQrOrdering: toBoolean(
      current.enableQrOrdering,
      DEFAULT_OUTLET_SETTINGS.enableQrOrdering,
    ),
    enableReservations: toBoolean(
      current.enableReservations,
      DEFAULT_OUTLET_SETTINGS.enableReservations,
    ),
    enableTokenQueue: toBoolean(
      current.enableTokenQueue,
      DEFAULT_OUTLET_SETTINGS.enableTokenQueue,
    ),
    defaultTabletLanguage: supportedTabletLanguages.includes(defaultTabletLanguage)
      ? defaultTabletLanguage
      : supportedTabletLanguages[0],
    supportedTabletLanguages,
    businessType: normalizeBusinessType(current.businessType),
    serviceModes: normalizeServiceModes(current.serviceModes),
    payments: normalizePaymentSettings(current.payments),
    integrations: normalizeIntegrations(current.integrations),
  };
}

export function mergeOutletSettings(current: unknown, updates: unknown) {
  return normalizeOutletSettings({
    ...toRecord(current),
    ...toRecord(updates),
  });
}

export function isTabletOrderingEnabled(value: unknown) {
  const settings = normalizeOutletSettings(value);
  return settings.enableTabletOrdering || settings.enableQrOrdering;
}

export function getTabletOrderingHref(tableId: string) {
  return `/tablet/${encodeURIComponent(tableId)}`;
}

"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  normalizeOutletSettings,
  TABLET_LANGUAGE_LABELS,
  TABLET_LANGUAGE_OPTIONS,
} from "@/lib/tablet-ordering";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Languages,
  Loader2,
  MonitorSmartphone,
  QrCode,
  Receipt,
  Save,
  Store,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { TabletLanguageCode } from "@/types";

type SettingsForm = {
  restaurantName: string;
  phone: string;
  address: string;
  gstNumber: string;
  fssaiNumber: string;
  taxRate: number;
  serviceCharge: number;
  printReceiptAutomatically: boolean;
  enableKDS: boolean;
  enableOnlineOrders: boolean;
  enableTabletOrdering: boolean;
  enableQrOrdering: boolean;
  defaultTabletLanguage: TabletLanguageCode;
};

const DEFAULT_SETTINGS: SettingsForm = {
  restaurantName: "My Restaurant",
  phone: "+91 98765 43210",
  address: "123 Main St, City",
  gstNumber: "27AAAAA0000A1Z5",
  fssaiNumber: "10012022000001",
  taxRate: 5,
  serviceCharge: 0,
  printReceiptAutomatically: true,
  enableKDS: true,
  enableOnlineOrders: false,
  enableTabletOrdering: false,
  enableQrOrdering: false,
  defaultTabletLanguage: "en",
};

function parseNumericInput(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsForm>(DEFAULT_SETTINGS);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await apiClient.get("/settings");
        const data = res.data;
        const normalized = normalizeOutletSettings(data.settings);
        setSettings({
          restaurantName: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          gstNumber: data.gstin || "",
          fssaiNumber: data.fssaiNumber || "",
          taxRate: normalized.taxRate,
          serviceCharge: normalized.serviceCharge,
          printReceiptAutomatically: normalized.printReceiptAutomatically,
          enableKDS: normalized.enableKDS,
          enableOnlineOrders: normalized.enableOnlineOrders,
          enableTabletOrdering: normalized.enableTabletOrdering,
          enableQrOrdering: normalized.enableQrOrdering,
          defaultTabletLanguage: normalized.defaultTabletLanguage,
        });
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    }

    void loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const payload = {
        name: settings.restaurantName,
        phone: settings.phone,
        address: settings.address,
        gstin: settings.gstNumber,
        fssaiNumber: settings.fssaiNumber,
        settings: {
          taxRate: settings.taxRate,
          serviceCharge: settings.serviceCharge,
          printReceiptAutomatically: settings.printReceiptAutomatically,
          enableKDS: settings.enableKDS,
          enableOnlineOrders: settings.enableOnlineOrders,
          enableTabletOrdering: settings.enableTabletOrdering,
          enableQrOrdering: settings.enableQrOrdering,
          defaultTabletLanguage: settings.defaultTabletLanguage,
        },
      };

      await apiClient.patch("/settings", payload);
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tabletSubsystemEnabled = settings.enableTabletOrdering || settings.enableQrOrdering;

  return (
    <div className="min-h-full bg-background p-6 md:p-8">
      <div className="mb-8">
        <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-primary/14 via-card to-tertiary/12 shadow-[var(--shadow-elevation-2)]">
          <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                Bhukkad Control Room
              </div>
              <div className="space-y-2">
                <h1 className="brand-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                  Outlet Settings
                </h1>
                <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
                  Tune your restaurant identity, billing defaults, and service-floor features from
                  a single Bhukkad v2 workspace.
                </p>
              </div>
                <div className="flex flex-wrap gap-3 text-sm font-medium text-muted-foreground">
                  <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2">
                    Live outlet:{" "}
                    <span className="font-semibold text-foreground">
                      {settings.restaurantName || "Unnamed restaurant"}
                  </span>
                </div>
                <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2">
                  KDS:{" "}
                    <span className="font-semibold text-foreground">
                      {settings.enableKDS ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2">
                    Tablet ordering:{" "}
                    <span className="font-semibold text-foreground">
                      {tabletSubsystemEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            <Button onClick={handleSave} disabled={isSaving} className="min-w-44">
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 h-auto w-full flex-wrap justify-start gap-2 rounded-[var(--radius-large)] border border-border/70 bg-surface-container-high p-1.5">
          <TabsTrigger
            value="general"
            className="gap-2 rounded-[var(--radius-medium)] px-4 py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-elevation-1)]"
          >
            <Store className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="gap-2 rounded-[var(--radius-medium)] px-4 py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-elevation-1)]"
          >
            <Receipt className="h-4 w-4" />
            Billing &amp; Taxes
          </TabsTrigger>
          <TabsTrigger
            value="tablet"
            className="gap-2 rounded-[var(--radius-medium)] px-4 py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-elevation-1)]"
          >
            <MonitorSmartphone className="h-4 w-4" />
            Tablet &amp; QR
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="gap-2 rounded-[var(--radius-medium)] px-4 py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-elevation-1)]"
          >
            <Users className="h-4 w-4" />
            Users &amp; Roles
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="gap-2 rounded-[var(--radius-medium)] px-4 py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-elevation-1)]"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-0 space-y-6">
          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle className="brand-display text-3xl font-semibold">
                Restaurant Identity
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Brand, contact, and compliance details used across bills and customer touchpoints.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Restaurant name" htmlFor="restaurantName">
                <Input
                  id="restaurantName"
                  value={settings.restaurantName}
                  onChange={(e) => handleChange("restaurantName", e.target.value)}
                />
              </Field>
              <Field label="Phone number" htmlFor="phone">
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </Field>
              <Field label="Address" htmlFor="address" className="md:col-span-2">
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </Field>
              <Field label="GST number" htmlFor="gstNumber">
                <Input
                  id="gstNumber"
                  value={settings.gstNumber}
                  onChange={(e) => handleChange("gstNumber", e.target.value)}
                />
              </Field>
              <Field label="FSSAI number" htmlFor="fssaiNumber">
                <Input
                  id="fssaiNumber"
                  value={settings.fssaiNumber}
                  onChange={(e) => handleChange("fssaiNumber", e.target.value)}
                />
              </Field>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle className="brand-display text-3xl font-semibold">
                Service Floor Features
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Turn operational modes on or off without leaving the Bhukkad shell.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FeatureToggle
                title="Kitchen Display System (KDS)"
                description="Send orders directly to digital kitchen screens for smoother ticket flow."
                checked={settings.enableKDS}
                onCheckedChange={(checked) => handleChange("enableKDS", checked)}
              />
              <FeatureToggle
                title="Online Orders"
                description="Accept aggregator or direct online orders without switching systems."
                checked={settings.enableOnlineOrders}
                onCheckedChange={(checked) => handleChange("enableOnlineOrders", checked)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-0 space-y-6">
          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle className="brand-display text-3xl font-semibold">
                Taxes &amp; Charges
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Keep your default tax configuration consistent at the billing counter.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Default GST rate (%)" htmlFor="taxRate">
                <Input
                  id="taxRate"
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => handleChange("taxRate", parseNumericInput(e.target.value))}
                />
              </Field>
              <Field label="Service charge (%)" htmlFor="serviceCharge">
                <Input
                  id="serviceCharge"
                  type="number"
                  value={settings.serviceCharge}
                  onChange={(e) =>
                    handleChange("serviceCharge", parseNumericInput(e.target.value))
                  }
                />
              </Field>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle className="brand-display text-3xl font-semibold">
                Billing Experience
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Fine-tune what happens the moment a bill is closed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeatureToggle
                title="Auto-print Receipts"
                description="Automatically print a guest receipt the moment payment is completed."
                checked={settings.printReceiptAutomatically}
                onCheckedChange={(checked) =>
                  handleChange("printReceiptAutomatically", checked)
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tablet" className="mt-0 space-y-6">
          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle className="brand-display text-3xl font-semibold">
                Guest Ordering Controls
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Promote tablet and QR ordering to a stable first-class subsystem without
                fragmenting your order pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FeatureToggle
                title="Tablet Ordering"
                description="Enable the dedicated public tablet ordering experience for dine-in tables."
                checked={settings.enableTabletOrdering}
                onCheckedChange={(checked) => handleChange("enableTabletOrdering", checked)}
              />
              <FeatureToggle
                title="QR Ordering"
                description="Allow the same guest ordering flow to power printed QR links at the table."
                checked={settings.enableQrOrdering}
                onCheckedChange={(checked) => handleChange("enableQrOrdering", checked)}
              />
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle className="brand-display text-3xl font-semibold">
                Guest Experience Defaults
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Choose the default language guests see when the tablet or QR menu opens.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Default guest language" htmlFor="defaultTabletLanguage">
                <Select
                  value={settings.defaultTabletLanguage}
                  onValueChange={(value) =>
                    handleChange("defaultTabletLanguage", value as TabletLanguageCode)
                  }
                >
                  <SelectTrigger id="defaultTabletLanguage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TABLET_LANGUAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.code} value={option.code}>
                        {option.label} · {option.nativeLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="rounded-[var(--radius-large)] border border-border/70 bg-surface-container-high p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                    <Languages className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Current guest default</p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {TABLET_LANGUAGE_LABELS[settings.defaultTabletLanguage]}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/95">
            <CardContent className="grid gap-4 p-5 md:grid-cols-3">
              <StatusCard
                title="Tablet ordering"
                value={settings.enableTabletOrdering ? "On" : "Off"}
                description="Dedicated guest-facing tablet shell"
                icon={<MonitorSmartphone className="h-4 w-4" />}
              />
              <StatusCard
                title="QR ordering"
                value={settings.enableQrOrdering ? "On" : "Off"}
                description="Printed QR codes use the same public subsystem"
                icon={<QrCode className="h-4 w-4" />}
              />
              <StatusCard
                title="Default language"
                value={TABLET_LANGUAGE_LABELS[settings.defaultTabletLanguage]}
                description="Applies when guests first open the menu"
                icon={<Languages className="h-4 w-4" />}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-0">
          <PlaceholderPanel
            title="Users & Roles Management"
            description="Staff accounts, PINs, and permission controls are ready for the same Bhukkad v2 treatment next."
            actionLabel="Manage Users"
          />
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <PlaceholderPanel
            title="Notification Settings"
            description="Configure sound and visual alerts for new orders, kitchen updates, and service-floor exceptions."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-[var(--radius-large)] border border-border/70 bg-surface-container-high p-4 ${className ?? ""}`}
    >
      <Label
        htmlFor={htmlFor}
        className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground"
      >
        {label}
      </Label>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function FeatureToggle({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--radius-large)] border border-border/70 bg-surface-container-high p-4">
      <div className="space-y-1">
        <Label className="text-base font-semibold text-foreground">{title}</Label>
        <p className="text-sm font-medium text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function PlaceholderPanel({
  title,
  description,
  actionLabel,
}: {
  title: string;
  description: string;
  actionLabel?: string;
}) {
  return (
    <Card className="border-border/70 bg-card/95">
      <CardContent className="space-y-5 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[var(--radius-medium)] bg-primary/10 text-primary">
          <Store className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="brand-display text-3xl font-semibold text-foreground">{title}</h3>
          <p className="mx-auto max-w-xl text-sm font-medium leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {actionLabel ? <Button variant="outline">{actionLabel}</Button> : null}
      </CardContent>
    </Card>
  );
}

function StatusCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-large)] border border-border/70 bg-surface-container-high p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="brand-display text-3xl font-semibold text-foreground">{value}</p>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="rounded-full bg-primary/10 p-2 text-primary">{icon}</div>
      </div>
    </div>
  );
}

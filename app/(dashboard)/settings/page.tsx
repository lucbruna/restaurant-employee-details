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
  restaurantName: "Meu Restaurante",
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
        toast.error("Falha ao carregar configurações");
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
      toast.success("Configurações salvas com sucesso");
    } catch {
      toast.error("Falha ao salvar configurações");
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
                Sala de Controle Bhukkad
              </div>
              <div className="space-y-2">
                <h1 className="brand-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                  Configurações do Estabelecimento
                </h1>
                <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
                  Ajuste a identidade do seu restaurante, padrões de faturamento e recursos do salão
                  a partir de um único workspace Bhukkad v2.
                </p>
              </div>
                <div className="flex flex-wrap gap-3 text-sm font-medium text-muted-foreground">
                  <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2">
                    Estabelecimento ativo:{" "}
                    <span className="font-semibold text-foreground">
                      {settings.restaurantName || "Restaurante sem nome"}
                  </span>
                </div>
                <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2">
                  KDS:{" "}
                    <span className="font-semibold text-foreground">
                      {settings.enableKDS ? "Ativado" : "Desativado"}
                    </span>
                  </div>
                  <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2">
                    Pedido Tablet:{" "}
                    <span className="font-semibold text-foreground">
                      {tabletSubsystemEnabled ? "Ativado" : "Desativado"}
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
              Salvar Alterações
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
            Geral
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="gap-2 rounded-[var(--radius-medium)] px-4 py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-elevation-1)]"
          >
            <Receipt className="h-4 w-4" />
            Faturamento e Impostos
          </TabsTrigger>
          <TabsTrigger
            value="tablet"
            className="gap-2 rounded-[var(--radius-medium)] px-4 py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-elevation-1)]"
          >
            <MonitorSmartphone className="h-4 w-4" />
            Tablet e QR
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="gap-2 rounded-[var(--radius-medium)] px-4 py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-elevation-1)]"
          >
            <Users className="h-4 w-4" />
            Usuários e Funções
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="gap-2 rounded-[var(--radius-medium)] px-4 py-2.5 font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-elevation-1)]"
          >
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-0 space-y-6">
          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle className="brand-display text-3xl font-semibold">
                Identidade do Restaurante
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Detalhes da marca, contato e conformidade usados em contas e pontos de contato com o cliente.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nome do restaurante" htmlFor="restaurantName">
                <Input
                  id="restaurantName"
                  value={settings.restaurantName}
                  onChange={(e) => handleChange("restaurantName", e.target.value)}
                />
              </Field>
              <Field label="Número de telefone" htmlFor="phone">
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </Field>
              <Field label="Endereço" htmlFor="address" className="md:col-span-2">
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </Field>
              <Field label="Número GST" htmlFor="gstNumber">
                <Input
                  id="gstNumber"
                  value={settings.gstNumber}
                  onChange={(e) => handleChange("gstNumber", e.target.value)}
                />
              </Field>
              <Field label="Número FSSAI" htmlFor="fssaiNumber">
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
                Recursos do Salão de Serviço
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Ative ou desative modos operacionais sem sair do shell Bhukkad.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FeatureToggle
                title="Sistema de Display da Cozinha (KDS)"
                description="Envie pedidos diretamente para telas digitais da cozinha para um fluxo de tickets mais suave."
                checked={settings.enableKDS}
                onCheckedChange={(checked) => handleChange("enableKDS", checked)}
              />
              <FeatureToggle
                title="Pedidos Online"
                description="Aceite pedidos online diretos ou de agregadores sem mudar de sistema."
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
                Impostos e Taxas
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Mantenha sua configuração de imposto padrão consistente no balcão de faturamento.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Taxa GST padrão (%)" htmlFor="taxRate">
                <Input
                  id="taxRate"
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => handleChange("taxRate", parseNumericInput(e.target.value))}
                />
              </Field>
              <Field label="Taxa de serviço (%)" htmlFor="serviceCharge">
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
                Experiência de Faturamento
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Ajuste o que acontece no momento em que uma conta é fechada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeatureToggle
                title="Impressão Automática de Recibos"
                description="Imprimir automaticamente um recibo do cliente no momento em que o pagamento é concluído."
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
                Controles de Pedido do Cliente
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Promova o pedido por tablet e QR para um subsistema estável de primeira classe sem
                fragmentar seu pipeline de pedidos.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FeatureToggle
                title="Pedido Tablet"
                description="Ative a experiência dedicada de pedido por tablet para mesas de refeição local."
                checked={settings.enableTabletOrdering}
                onCheckedChange={(checked) => handleChange("enableTabletOrdering", checked)}
              />
              <FeatureToggle
                title="Pedido por QR"
                description="Permita que o mesmo fluxo de pedido do cliente alimente links QR impressos na mesa."
                checked={settings.enableQrOrdering}
                onCheckedChange={(checked) => handleChange("enableQrOrdering", checked)}
              />
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle className="brand-display text-3xl font-semibold">
                Padrões de Experiência do Cliente
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Escolha o idioma padrão que os clientes veem quando o cardápio do tablet ou QR é aberto.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Idioma padrão do cliente" htmlFor="defaultTabletLanguage">
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
                    <p className="text-sm font-semibold text-foreground">Idioma padrão atual do cliente</p>
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
                title="Pedido Tablet"
                value={settings.enableTabletOrdering ? "Ligado" : "Desligado"}
                description="Shell de tablet dedicado para o cliente"
                icon={<MonitorSmartphone className="h-4 w-4" />}
              />
              <StatusCard
                title="Pedido por QR"
                value={settings.enableQrOrdering ? "Ligado" : "Desligado"}
                description="Códigos QR impressos usam o mesmo subsistema público"
                icon={<QrCode className="h-4 w-4" />}
              />
              <StatusCard
                title="Idioma padrão"
                value={TABLET_LANGUAGE_LABELS[settings.defaultTabletLanguage]}
                description="Aplicado quando os clientes abrem o cardápio"
                icon={<Languages className="h-4 w-4" />}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-0">
          <PlaceholderPanel
            title="Gerenciamento de Usuários e Funções"
            description="Contas de funcionários, PINs e controles de permissão estão prontos para o mesmo tratamento Bhukkad v2 em seguida."
            actionLabel="Gerenciar Usuários"
          />
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <PlaceholderPanel
            title="Configurações de Notificação"
            description="Configure alertas sonoros e visuais para novos pedidos, atualizações da cozinha e exceções do salão."
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

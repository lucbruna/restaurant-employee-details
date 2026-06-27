"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import {
  BarChart3,
  Calendar,
  IndianRupee,
  Loader2,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { ResponsiveChartFrame } from "@/components/charts/responsive-chart-frame";
import type { ReportsSummary } from "@/lib/analytics";

function formatServiceDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTrend(changePct: number) {
  const prefix = changePct > 0 ? "+" : "";
  return `${prefix}${changePct.toFixed(1)}%`;
}

function formatChartCurrency(value: unknown) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const numericValue = Number(rawValue ?? 0);

  return formatCurrency(Number.isFinite(numericValue) ? numericValue : 0);
}

type StatCardProps = {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
  iconClassName: string;
};

export default function ReportsPage() {
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadReports = useCallback(async (options?: { refresh?: boolean; showToast?: boolean }) => {
    const refresh = options?.refresh ?? false;
    const showToast = options?.showToast ?? false;

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await apiClient.get<ReportsSummary>("/reports/summary");
      setSummary(response.data);
      if (showToast) {
        toast.success("Relatórios atualizados");
      }
    } catch {
      toast.error("Falha ao carregar relatórios");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  if (isLoading && !summary) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background p-8">
        <Card className="max-w-md border-border/70 bg-card/90">
          <CardContent className="space-y-4 p-8 text-center">
            <h2 className="brand-display text-2xl font-semibold text-foreground">
              Relatórios indisponíveis
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              Não foi possível carregar o resumo analítico mais recente.
            </p>
            <Button onClick={() => void loadReports()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bestDay =
    summary.weeklyPerformance.length > 0
      ? summary.weeklyPerformance.reduce((best, day) =>
          day.sales > best.sales ? day : best,
        )
      : null;
  const weeklyOrders = summary.weeklyPerformance.reduce((sum, day) => sum + day.orders, 0);
  const stats: StatCardProps[] = [
    {
      title: "Vendas Totais",
      value: formatCurrency(summary.stats.totalSales.value),
      icon: <IndianRupee className="h-5 w-5" />,
      trend: formatTrend(summary.stats.totalSales.changePct),
      trendUp: summary.stats.totalSales.changePct >= 0,
      iconClassName: "bg-primary text-primary-foreground",
    },
    {
      title: "Total de Pedidos",
      value: summary.stats.totalOrders.value.toString(),
      icon: <ShoppingBag className="h-5 w-5" />,
      trend: formatTrend(summary.stats.totalOrders.changePct),
      trendUp: summary.stats.totalOrders.changePct >= 0,
      iconClassName: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Valor Médio do Pedido",
      value: formatCurrency(summary.stats.averageOrderValue.value),
      icon: <TrendingUp className="h-5 w-5" />,
      trend: formatTrend(summary.stats.averageOrderValue.changePct),
      trendUp: summary.stats.averageOrderValue.changePct >= 0,
      iconClassName: "bg-tertiary text-tertiary-foreground",
    },
    {
      title: "Clientes Ativos",
      value: summary.stats.activeCustomers.value.toString(),
      icon: <Users className="h-5 w-5" />,
      trend: formatTrend(summary.stats.activeCustomers.changePct),
      trendUp: summary.stats.activeCustomers.changePct >= 0,
      iconClassName: "bg-accent text-accent-foreground",
    },
  ];

  return (
    <div className="min-h-full bg-background p-6 md:p-8">
      <div className="mb-8">
        <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-primary/14 via-card to-secondary/12 shadow-[var(--shadow-elevation-2)]">
          <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                Pulso Semanal Bhukkad
              </div>
              <div className="space-y-2">
                <h1 className="brand-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                  Análises e Relatórios
                </h1>
                <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
                  Resumo semanal de serviço terminando em {formatServiceDate(summary.serviceDate)} em
                  vendas, fluxo de pedidos e movimento de clientes.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm font-medium text-muted-foreground">
                <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2">
                  Dia de pico:{" "}
                    <span className="font-semibold text-foreground">
                      {bestDay ? bestDay.name : "Aguardando dados"}
                    </span>
                </div>
                <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2">
                  Pedidos semanais: <span className="font-semibold text-foreground">{weeklyOrders}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-border/70 bg-card/80">
                <Calendar className="mr-2 h-4 w-4" />
                {formatServiceDate(summary.serviceDate)}
              </Button>
              <Button onClick={() => void loadReports({ refresh: true, showToast: true })}>
                {isRefreshing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Atualizar Instantâneo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <Card className="border-border/70 bg-card/95">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle className="brand-display text-3xl font-semibold">Vendas Semanais</CardTitle>
              <CardDescription className="text-sm font-medium">
                Cadência de receita nos últimos sete dias de serviço.
              </CardDescription>
            </div>
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              Calor da receita
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveChartFrame className="h-[320px] w-full">
              {({ height, width }) => (
                <BarChart
                  data={summary.weeklyPerformance}
                  height={height}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  width={width}
                >
                  <CartesianGrid
                    strokeDasharray="4 6"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontWeight: 600 }}
                    tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
                  />
                  <Tooltip
                    cursor={{ fill: "color-mix(in srgb, var(--primary) 8%, transparent)" }}
                    contentStyle={{
                      borderRadius: "22px",
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      boxShadow: "var(--shadow-elevation-2)",
                    }}
                    formatter={(value) => formatChartCurrency(value)}
                    itemStyle={{ color: "var(--foreground)", fontWeight: 700 }}
                    labelStyle={{ color: "var(--muted-foreground)", fontWeight: 700 }}
                  />
                  <Bar
                    dataKey="sales"
                    fill="var(--primary)"
                    radius={[14, 14, 0, 0]}
                    maxBarSize={44}
                  />
                </BarChart>
              )}
            </ResponsiveChartFrame>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/95">
          <CardHeader>
            <CardTitle className="brand-display text-3xl font-semibold">Tendência de Pedidos</CardTitle>
            <CardDescription className="text-sm font-medium">
              Consistência da demanda dos clientes na mesma janela semanal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveChartFrame className="h-[320px] w-full">
              {({ height, width }) => (
                <LineChart
                  data={summary.weeklyPerformance}
                  height={height}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  width={width}
                >
                  <CartesianGrid
                    strokeDasharray="4 6"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "22px",
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      boxShadow: "var(--shadow-elevation-2)",
                    }}
                    itemStyle={{ color: "var(--foreground)", fontWeight: 700 }}
                    labelStyle={{ color: "var(--muted-foreground)", fontWeight: 700 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="var(--tertiary)"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "var(--tertiary)",
                      strokeWidth: 2,
                      stroke: "var(--card)",
                    }}
                    activeDot={{ r: 6, fill: "var(--primary)" }}
                  />
                </LineChart>
              )}
            </ResponsiveChartFrame>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="border-border/70 bg-card/95 lg:col-span-2">
          <CardHeader>
            <CardTitle className="brand-display text-3xl font-semibold">
              Notas de Desempenho
            </CardTitle>
            <CardDescription className="text-sm font-medium">
              Leituras rápidas para o operador em campo.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <SignalCard
              label="Dia de pico de receita"
              value={bestDay ? bestDay.name : "Aguardando dados"}
              detail={
                bestDay
                  ? `${formatCurrency(bestDay.sales)} de ${bestDay.orders} pedidos faturados`
                  : "Os dados de vendas serão preenchidos após o início do faturamento"
              }
            />
            <SignalCard
              label="Momentum de clientes"
              value={formatTrend(summary.stats.activeCustomers.changePct)}
              detail={`${summary.stats.activeCustomers.value} clientes ativos no ciclo atual`}
            />
            <SignalCard
              label="Qualidade do carrinho"
              value={formatCurrency(summary.stats.averageOrderValue.value)}
              detail={`${formatTrend(summary.stats.averageOrderValue.changePct)} em relação à semana anterior`}
            />
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/95">
          <CardHeader>
            <CardTitle className="brand-display text-3xl font-semibold">
              Modo de Insights
            </CardTitle>
            <CardDescription className="text-sm font-medium">
              Bhukkad v2 mantém o sinal visível mesmo durante uma correria.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm font-medium text-muted-foreground">
            <div className="rounded-[var(--radius-medium)] border border-border/70 bg-surface-container-high p-4">
              Cores quentes de receita e superfícies arredondadas espelham o shell de serviço principal do Bhukkad.
            </div>
            <div className="rounded-[var(--radius-medium)] border border-border/70 bg-surface-container-high p-4">
              Os gráficos agora usam tokens semânticos para que o modo escuro e futuras alterações de marca sejam herdados corretamente.
            </div>
            <div className="rounded-[var(--radius-medium)] border border-border/70 bg-surface-container-high p-4">
              Os resumos do operador são escritos para leitura rápida em vez de cromo analítico genérico.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, trendUp, icon, iconClassName }: StatCardProps) {
  return (
    <Card className="group overflow-hidden border-border/70 bg-card/95 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevation-2)]">
      <CardContent className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-[var(--radius-medium)] shadow-[var(--shadow-elevation-1)] ${iconClassName}`}
          >
            {icon}
          </div>
          <div
            className={`rounded-full px-2.5 py-1 text-[11px] font-black tracking-wide ${
              trendUp ? "bg-tertiary/15 text-tertiary" : "bg-destructive/12 text-destructive"
            }`}
          >
            {trend}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
            {title}
          </p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

function SignalCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[var(--radius-large)] border border-border/70 bg-surface-container-high p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <h3 className="mt-3 brand-display text-2xl font-semibold text-foreground">{value}</h3>
      <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

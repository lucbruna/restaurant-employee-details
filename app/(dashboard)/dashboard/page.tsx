"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { ResponsiveChartFrame } from "@/components/charts/responsive-chart-frame";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import type { DashboardOverview } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils/currency";

function formatServiceDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatChange(changePct: number) {
  const prefix = changePct > 0 ? "+" : "";
  return `${prefix}${changePct.toFixed(1)}%`;
}

function formatChartCurrency(value: unknown) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const numericValue = Number(rawValue ?? 0);

  return formatCurrency(Number.isFinite(numericValue) ? numericValue : 0);
}

function getRankBadgeClasses(index: number) {
  if (index === 0) return "bg-primary text-primary-foreground";
  if (index === 1) return "bg-secondary text-secondary-foreground";
  if (index === 2) return "bg-tertiary text-tertiary-foreground";
  return "bg-accent text-accent-foreground";
}

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  isUp: boolean;
  icon: React.ReactNode;
  iconClassName: string;
  changeClassName: string;
};

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOverview = useCallback(async (showToast = false) => {
    try {
      const response = await apiClient.get<DashboardOverview>("/dashboard/overview");
      setOverview(response.data);
      if (showToast) {
        toast.success("Dashboard refreshed");
      }
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  if (isLoading && !overview) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background p-8">
        <Card className="max-w-md border-border/70 bg-card/90">
          <CardContent className="space-y-4 p-8 text-center">
            <h2 className="brand-display text-2xl font-semibold text-foreground">
              Dashboard unavailable
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              We couldn&apos;t load the live outlet summary just now.
            </p>
            <Button
              onClick={() => {
                setIsLoading(true);
                void loadOverview();
              }}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const peakRevenue = Math.max(...overview.topItems.map((item) => item.revenue), 0);
  const stats = [
    {
      title: "Today's Sales",
      value: formatCurrency(overview.stats.sales.value),
      change: formatChange(overview.stats.sales.changePct),
      isUp: overview.stats.sales.changePct >= 0,
      icon: <DollarSign className="h-5 w-5" />,
      iconClassName: "bg-primary text-primary-foreground",
      changeClassName:
        overview.stats.sales.changePct >= 0
          ? "bg-tertiary/15 text-tertiary"
          : "bg-destructive/12 text-destructive",
    },
    {
      title: "Total Orders",
      value: overview.stats.orders.value.toString(),
      change: formatChange(overview.stats.orders.changePct),
      isUp: overview.stats.orders.changePct >= 0,
      icon: <ShoppingBag className="h-5 w-5" />,
      iconClassName: "bg-secondary text-secondary-foreground",
      changeClassName:
        overview.stats.orders.changePct >= 0
          ? "bg-tertiary/15 text-tertiary"
          : "bg-destructive/12 text-destructive",
    },
    {
      title: "Avg. Order Value",
      value: formatCurrency(overview.stats.averageOrderValue.value),
      change: formatChange(overview.stats.averageOrderValue.changePct),
      isUp: overview.stats.averageOrderValue.changePct >= 0,
      icon: <DollarSign className="h-5 w-5" />,
      iconClassName: "bg-tertiary text-tertiary-foreground",
      changeClassName:
        overview.stats.averageOrderValue.changePct >= 0
          ? "bg-tertiary/15 text-tertiary"
          : "bg-destructive/12 text-destructive",
    },
    {
      title: "New Customers",
      value: overview.stats.newCustomers.value.toString(),
      change: formatChange(overview.stats.newCustomers.changePct),
      isUp: overview.stats.newCustomers.changePct >= 0,
      icon: <Users className="h-5 w-5" />,
      iconClassName: "bg-accent text-accent-foreground",
      changeClassName:
        overview.stats.newCustomers.changePct >= 0
          ? "bg-tertiary/15 text-tertiary"
          : "bg-destructive/12 text-destructive",
    },
  ];

  return (
    <div className="min-h-full bg-background p-6 md:p-8">
      <div className="mb-8">
        <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-primary/14 via-card to-tertiary/10 shadow-[var(--shadow-elevation-2)]">
          <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                Bhukkad Service Pulse
              </div>
              <div className="space-y-2">
                <h1 className="brand-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                  Outlet Dashboard
                </h1>
                <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
                  Live restaurant performance for {formatServiceDate(overview.serviceDate)} across billing, order flow, and guest acquisition.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-border/70 bg-card/80">
                <Calendar className="mr-2 h-4 w-4" />
                {formatServiceDate(overview.serviceDate)}
              </Button>
              <Button
                onClick={() => {
                  setIsRefreshing(true);
                  void loadOverview(true);
                }}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh Snapshot
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

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
        <Card className="border-border/70 bg-card/95">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle className="brand-display text-3xl font-semibold">
                Sales Rhythm
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Hour-by-hour revenue flow for the current service day.
              </CardDescription>
            </div>
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              Hourly sales
            </div>
          </CardHeader>
          <CardContent>
            {overview.salesByHour.length === 0 ? (
              <div className="flex h-[350px] w-full flex-col items-center justify-center text-center text-muted-foreground">
                <p className="brand-display text-2xl font-semibold text-foreground">
                  No hourly sales yet
                </p>
                <p className="mt-2 text-sm font-medium">
                  Sales trend will populate once live orders are billed.
                </p>
              </div>
            ) : (
              <ResponsiveChartFrame className="h-[350px] w-full">
                {({ height, width }) => (
                  <AreaChart data={overview.salesByHour} height={height} width={width}>
                    <defs>
                      <linearGradient id="bhukkadSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.38} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fontWeight: 600, fill: "var(--muted-foreground)" }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fontWeight: 600, fill: "var(--muted-foreground)" }}
                      tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
                    />
                    <Tooltip
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
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      fill="url(#bhukkadSales)"
                    />
                  </AreaChart>
                )}
              </ResponsiveChartFrame>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/95">
          <CardHeader>
            <CardTitle className="brand-display text-3xl font-semibold">
              Top Selling Items
            </CardTitle>
            <CardDescription className="text-sm font-medium">
              Best performing dishes by billed revenue and quantity sold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overview.topItems.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p className="brand-display text-2xl font-semibold text-foreground">
                  No item sales yet
                </p>
                <p className="mt-2 text-sm font-medium">
                  Top items will appear once live orders come in.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {overview.topItems.map((item, index) => (
                  <div
                    key={item.name}
                    className="rounded-[var(--radius-large)] border border-border/60 bg-surface-container-high p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-[var(--radius-medium)] text-sm font-black shadow-[var(--shadow-elevation-1)] ${getRankBadgeClasses(index)}`}
                        >
                          #{index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.name}</p>
                          <p className="mt-1 text-xs font-medium text-muted-foreground">
                            {item.orders} qty sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(item.revenue)}
                        </p>
                        <p className="mt-1 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                          Revenue
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-tertiary"
                        style={{
                          width: peakRevenue > 0 ? `${(item.revenue / peakRevenue) * 100}%` : "0%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  isUp,
  icon,
  iconClassName,
  changeClassName,
}: StatCardProps) {
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
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black tracking-wide ${changeClassName}`}
          >
            {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {change}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
            {title}
          </p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
}

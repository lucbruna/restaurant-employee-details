import { desc, eq } from 'drizzle-orm';

import { db } from '@/db';
import { customers, dayEndReports, orders } from '@/db/schema';

const IST_TIMEZONE = 'Asia/Kolkata';
const HOUR_FORMATTER = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  hour12: true,
  timeZone: IST_TIMEZONE,
});

type Metric = {
  value: number;
  changePct: number;
};

export type DashboardOverview = {
  serviceDate: string;
  stats: {
    sales: Metric;
    orders: Metric;
    averageOrderValue: Metric;
    newCustomers: Metric;
  };
  salesByHour: Array<{ name: string; sales: number }>;
  topItems: Array<{ name: string; orders: number; revenue: number }>;
};

export type ReportsSummary = {
  serviceDate: string;
  stats: {
    totalSales: Metric;
    totalOrders: Metric;
    averageOrderValue: Metric;
    activeCustomers: Metric;
  };
  weeklyPerformance: Array<{ name: string; sales: number; orders: number }>;
};

function parseSqliteTimestamp(value?: string | null) {
  if (!value) return null;
  if (value.includes('T') || value.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(value);
  }

  return new Date(value.replace(' ', 'T') + 'Z');
}

function toIstDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: IST_TIMEZONE,
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value ?? '1970';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';

  return `${year}-${month}-${day}`;
}

function shiftDateKey(dateKey: string, days: number) {
  const shifted = new Date(`${dateKey}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
}

function toShortDay(dateKey: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${dateKey}T00:00:00Z`));
}

function toHourBucket(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    timeZone: IST_TIMEZONE,
  }).formatToParts(date);

  return Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
}

function toMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function toPercentChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function isAnalyticsOrder(status?: string | null) {
  return status !== 'draft' && status !== 'cancelled' && status !== 'void';
}

function summarizeOrders(orderRows: Array<{ totalAmount: number | null; customerId: string | null }>) {
  const totalSales = toMoney(orderRows.reduce((sum, order) => sum + (order.totalAmount ?? 0), 0));
  const totalOrders = orderRows.length;
  const averageOrderValue = totalOrders > 0 ? toMoney(totalSales / totalOrders) : 0;
  const activeCustomers = new Set(orderRows.map((order) => order.customerId).filter(Boolean)).size;

  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    activeCustomers,
  };
}

export async function getDashboardOverview(outletId: string): Promise<DashboardOverview> {
  const [orderRows, customerRows, latestReport] = await Promise.all([
    db.query.orders.findMany({
      where: eq(orders.outletId, outletId),
      with: {
        items: true,
      },
      orderBy: [desc(orders.createdAt)],
    }),
    db.query.customers.findMany({
      where: eq(customers.outletId, outletId),
      orderBy: [desc(customers.createdAt)],
    }),
    db.query.dayEndReports.findFirst({
      where: eq(dayEndReports.outletId, outletId),
      orderBy: [desc(dayEndReports.reportDate)],
    }),
  ]);

  const validOrders = orderRows.filter(
    (order) => isAnalyticsOrder(order.status) && parseSqliteTimestamp(order.createdAt),
  );

  const serviceDate =
    latestReport?.reportDate ??
    (validOrders[0] ? toIstDateKey(parseSqliteTimestamp(validOrders[0].createdAt)!) : toIstDateKey(new Date()));
  const previousServiceDate = shiftDateKey(serviceDate, -1);

  const serviceOrders = validOrders.filter(
    (order) => toIstDateKey(parseSqliteTimestamp(order.createdAt)!) === serviceDate,
  );
  const previousServiceOrders = validOrders.filter(
    (order) => toIstDateKey(parseSqliteTimestamp(order.createdAt)!) === previousServiceDate,
  );

  const currentSummary = summarizeOrders(serviceOrders);
  const previousSummary = summarizeOrders(previousServiceOrders);

  const newCustomersToday = customerRows.filter((customer) => {
    const createdAt = parseSqliteTimestamp(customer.createdAt);
    return createdAt && toIstDateKey(createdAt) === serviceDate;
  }).length;
  const newCustomersPreviousDay = customerRows.filter((customer) => {
    const createdAt = parseSqliteTimestamp(customer.createdAt);
    return createdAt && toIstDateKey(createdAt) === previousServiceDate;
  }).length;

  const salesByHourMap = new Map<number, number>();
  for (const order of serviceOrders) {
    const createdAt = parseSqliteTimestamp(order.createdAt);
    if (!createdAt) continue;

    const hour = toHourBucket(createdAt);
    salesByHourMap.set(hour, (salesByHourMap.get(hour) ?? 0) + (order.totalAmount ?? 0));
  }

  const salesByHour = Array.from(salesByHourMap.entries())
    .sort(([left], [right]) => left - right)
    .map(([hour, total]) => ({
      name: HOUR_FORMATTER.format(new Date(Date.UTC(2026, 0, 1, hour))),
      sales: toMoney(total),
    }));

  const itemMap = new Map<string, { name: string; orders: number; revenue: number }>();
  for (const order of serviceOrders) {
    for (const item of order.items) {
      const existing = itemMap.get(item.itemName) ?? {
        name: item.itemName,
        orders: 0,
        revenue: 0,
      };

      existing.orders += item.quantity ?? 0;
      existing.revenue += item.itemTotal ?? 0;
      itemMap.set(item.itemName, existing);
    }
  }

  const topItems = Array.from(itemMap.values())
    .map((item) => ({
      ...item,
      revenue: toMoney(item.revenue),
    }))
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, 5);

  return {
    serviceDate,
    stats: {
      sales: {
        value: currentSummary.totalSales,
        changePct: toPercentChange(currentSummary.totalSales, previousSummary.totalSales),
      },
      orders: {
        value: currentSummary.totalOrders,
        changePct: toPercentChange(currentSummary.totalOrders, previousSummary.totalOrders),
      },
      averageOrderValue: {
        value: currentSummary.averageOrderValue,
        changePct: toPercentChange(
          currentSummary.averageOrderValue,
          previousSummary.averageOrderValue,
        ),
      },
      newCustomers: {
        value: newCustomersToday,
        changePct: toPercentChange(newCustomersToday, newCustomersPreviousDay),
      },
    },
    salesByHour,
    topItems,
  };
}

export async function getReportsSummary(outletId: string): Promise<ReportsSummary> {
  const [orderRows, latestReport] = await Promise.all([
    db.query.orders.findMany({
      where: eq(orders.outletId, outletId),
      orderBy: [desc(orders.createdAt)],
    }),
    db.query.dayEndReports.findFirst({
      where: eq(dayEndReports.outletId, outletId),
      orderBy: [desc(dayEndReports.reportDate)],
    }),
  ]);

  const validOrders = orderRows.filter(
    (order) => isAnalyticsOrder(order.status) && parseSqliteTimestamp(order.createdAt),
  );

  const serviceDate =
    latestReport?.reportDate ??
    (validOrders[0] ? toIstDateKey(parseSqliteTimestamp(validOrders[0].createdAt)!) : toIstDateKey(new Date()));
  const previousServiceDate = shiftDateKey(serviceDate, -1);

  const serviceOrders = validOrders.filter(
    (order) => toIstDateKey(parseSqliteTimestamp(order.createdAt)!) === serviceDate,
  );
  const previousServiceOrders = validOrders.filter(
    (order) => toIstDateKey(parseSqliteTimestamp(order.createdAt)!) === previousServiceDate,
  );

  const currentSummary = summarizeOrders(serviceOrders);
  const previousSummary = summarizeOrders(previousServiceOrders);

  const currentWeekKeys = Array.from({ length: 7 }, (_, index) => shiftDateKey(serviceDate, index - 6));
  const previousWeekKeys = Array.from({ length: 7 }, (_, index) =>
    shiftDateKey(previousServiceDate, index - 6),
  );

  const currentWeekOrders = validOrders.filter((order) =>
    currentWeekKeys.includes(toIstDateKey(parseSqliteTimestamp(order.createdAt)!)),
  );
  const previousWeekOrders = validOrders.filter((order) =>
    previousWeekKeys.includes(toIstDateKey(parseSqliteTimestamp(order.createdAt)!)),
  );

  const weeklyPerformance = currentWeekKeys.map((dateKey) => {
    const dayOrders = currentWeekOrders.filter(
      (order) => toIstDateKey(parseSqliteTimestamp(order.createdAt)!) === dateKey,
    );
    const summary = summarizeOrders(dayOrders);

    return {
      name: toShortDay(dateKey),
      sales: summary.totalSales,
      orders: summary.totalOrders,
    };
  });

  const currentWeeklyCustomers = new Set(
    currentWeekOrders.map((order) => order.customerId).filter(Boolean),
  ).size;
  const previousWeeklyCustomers = new Set(
    previousWeekOrders.map((order) => order.customerId).filter(Boolean),
  ).size;

  return {
    serviceDate,
    stats: {
      totalSales: {
        value: currentSummary.totalSales,
        changePct: toPercentChange(currentSummary.totalSales, previousSummary.totalSales),
      },
      totalOrders: {
        value: currentSummary.totalOrders,
        changePct: toPercentChange(currentSummary.totalOrders, previousSummary.totalOrders),
      },
      averageOrderValue: {
        value: currentSummary.averageOrderValue,
        changePct: toPercentChange(
          currentSummary.averageOrderValue,
          previousSummary.averageOrderValue,
        ),
      },
      activeCustomers: {
        value: currentWeeklyCustomers,
        changePct: toPercentChange(currentWeeklyCustomers, previousWeeklyCustomers),
      },
    },
    weeklyPerformance,
  };
}

"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Copy,
  Loader2,
  MonitorSmartphone,
  QrCode,
  Settings2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import {
  getTabletOrderingHref,
  normalizeOutletSettings,
  TABLET_LANGUAGE_LABELS,
} from "@/lib/tablet-ordering";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Table, TabletOrderingSettings } from "@/types";
import { toast } from "sonner";

type TableSection = {
  id: string;
  name: string;
};

const DEFAULT_SETTINGS: TabletOrderingSettings = normalizeOutletSettings({});

export default function TabletOrderingDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState<Table[]>([]);
  const [sections, setSections] = useState<TableSection[]>([]);
  const [settings, setSettings] = useState<TabletOrderingSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, tablesRes] = await Promise.all([
          apiClient.get("/settings"),
          apiClient.get("/tables"),
        ]);

        setSettings(normalizeOutletSettings(settingsRes.data?.settings));
        setTables(tablesRes.data?.tables ?? []);
        setSections(tablesRes.data?.sections ?? []);
      } catch (error) {
        console.error("Failed to load tablet ordering dashboard", error);
        toast.error("Unable to load tablet ordering data.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, []);

  const isSubsystemEnabled = settings.enableTabletOrdering || settings.enableQrOrdering;
  const groupedSections = sections.map((section) => ({
    ...section,
    tables: tables.filter((table) => table.sectionId === section.id),
  }));
  const unassignedTables = tables.filter(
    (table) => !sections.some((section) => section.id === table.sectionId),
  );

  async function copyTableLink(tableId: string) {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${getTabletOrderingHref(tableId)}`,
      );
      toast.success("Guest ordering link copied.");
    } catch {
      toast.error("Unable to copy the link right now.");
    }
  }

  function openTableLink(tableId: string) {
    window.open(getTabletOrderingHref(tableId), "_blank", "noopener,noreferrer");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-6 md:p-8">
      <div className="space-y-8">
        <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-primary/14 via-card to-tertiary/12 shadow-[var(--shadow-elevation-2)]">
          <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                Tablet / QR Ordering
              </div>
              <div className="space-y-2">
                <h1 className="brand-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                  First-Class Guest Ordering
                </h1>
                <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
                  Manage every public ordering touchpoint from one Bhukkad workspace, with
                  stable links per table and shared order creation under the hood.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm font-medium text-muted-foreground">
                <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2">
                  Tablet ordering:{" "}
                  <span className="font-semibold text-foreground">
                    {settings.enableTabletOrdering ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2">
                  QR ordering:{" "}
                  <span className="font-semibold text-foreground">
                    {settings.enableQrOrdering ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2">
                  Default language:{" "}
                  <span className="font-semibold text-foreground">
                    {TABLET_LANGUAGE_LABELS[settings.defaultTabletLanguage]}
                  </span>
                </div>
              </div>
            </div>

            <Button asChild className="min-w-44">
              <Link href="/settings">
                <Settings2 className="mr-2 h-4 w-4" />
                Update Settings
              </Link>
            </Button>
          </CardContent>
        </Card>

        {!isSubsystemEnabled ? (
          <Card className="border-amber-200 bg-amber-50/80">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-700">
                  Guest ordering is paused
                </p>
                <p className="text-sm font-medium leading-relaxed text-amber-900/80">
                  Turn on tablet ordering, QR ordering, or both in settings before sharing links
                  with guests.
                </p>
              </div>
              <Button asChild variant="outline" className="border-amber-300 bg-white">
                <Link href="/settings">
                  Open Settings
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Active public subsystem"
            value={isSubsystemEnabled ? "Live" : "Paused"}
            description="Shared createOrder flow keeps tablet and QR traffic on the same stable order pipeline."
            icon={<MonitorSmartphone className="h-5 w-5" />}
          />
          <MetricCard
            title="Tables ready for guest ordering"
            value={`${tables.length}`}
            description="Every table gets a dedicated guest URL that can power a tablet or printed QR."
            icon={<QrCode className="h-5 w-5" />}
          />
          <MetricCard
            title="Section coverage"
            value={`${sections.length || (unassignedTables.length > 0 ? 1 : 0)}`}
            description="Use sections to organize links and tablet deployments floor by floor."
            icon={<Settings2 className="h-5 w-5" />}
          />
        </div>

        <div className="space-y-6">
          {groupedSections.map((section) => (
            <SectionBlock
              key={section.id}
              title={section.name}
              tables={section.tables}
              onCopy={copyTableLink}
              onOpen={openTableLink}
            />
          ))}

          {unassignedTables.length > 0 ? (
            <SectionBlock
              title="Unassigned Tables"
              tables={unassignedTables}
              onCopy={copyTableLink}
              onOpen={openTableLink}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Card className="border-border/70 bg-card/95">
      <CardContent className="space-y-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-muted-foreground">{title}</p>
          <p className="brand-display text-3xl font-semibold text-foreground">{value}</p>
        </div>
        <p className="text-sm font-medium leading-relaxed text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function SectionBlock({
  title,
  tables,
  onCopy,
  onOpen,
}: {
  title: string;
  tables: Table[];
  onCopy: (tableId: string) => void;
  onOpen: (tableId: string) => void;
}) {
  if (tables.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="brand-display text-3xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm font-medium text-muted-foreground">
          Open each link as a tablet view or print it as a QR destination for guests.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tables.map((table) => (
          <Card key={table.id} className="border-border/70 bg-card/95">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl font-semibold text-foreground">
                    {table.name}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium">
                    Capacity {table.capacity}
                  </CardDescription>
                </div>
                <div className="rounded-full border border-border/70 bg-surface-container-high px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
                  {table.status}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-surface-container-high px-4 py-3 text-sm font-medium text-muted-foreground">
                {getTabletOrderingHref(table.id)}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => onOpen(table.id)} className="flex-1 min-w-36">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Open Guest View
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onCopy(table.id)}
                  className="flex-1 min-w-36"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

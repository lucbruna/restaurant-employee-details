"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Compass, LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StateTone = "loading" | "error" | "empty" | "success";

type StateAction = {
  href?: string;
  label: string;
  onClick?: () => void;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
};

type StatePanelProps = {
  eyebrow?: string;
  title: string;
  description: string;
  tone?: StateTone;
  primaryAction?: StateAction;
  secondaryAction?: StateAction;
  className?: string;
};

const toneStyles: Record<
  StateTone,
  {
    icon: React.ComponentType<React.ComponentProps<"svg">>;
    badge: string;
    iconWrap: string;
    orbit: string;
  }
> = {
  loading: {
    icon: LoaderCircle,
    badge: "bg-info/12 text-info",
    iconWrap: "bg-info/12 text-info",
    orbit: "from-info/18 via-transparent to-transparent",
  },
  error: {
    icon: AlertTriangle,
    badge: "bg-error/12 text-error",
    iconWrap: "bg-error/12 text-error",
    orbit: "from-error/18 via-transparent to-transparent",
  },
  empty: {
    icon: Compass,
    badge: "bg-secondary/12 text-secondary",
    iconWrap: "bg-secondary/12 text-secondary",
    orbit: "from-secondary/18 via-transparent to-transparent",
  },
  success: {
    icon: Sparkles,
    badge: "bg-success/12 text-success",
    iconWrap: "bg-success/12 text-success",
    orbit: "from-success/18 via-transparent to-transparent",
  },
};

function renderAction(action: StateAction) {
  const variant = action.variant ?? "default";

  if (action.href) {
    return (
      <Button asChild variant={variant}>
        <Link href={action.href}>
          {action.label}
          {variant === "default" ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
        </Link>
      </Button>
    );
  }

  return (
    <Button variant={variant} onClick={action.onClick}>
      {action.label}
      {variant === "default" ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
    </Button>
  );
}

export function StatePanel({
  eyebrow = "Bhukkad Service Layer",
  title,
  description,
  tone = "empty",
  primaryAction,
  secondaryAction,
  className,
}: StatePanelProps) {
  const toneStyle = toneStyles[tone];
  const Icon = toneStyle.icon;
  const spinning = tone === "loading";

  return (
    <section
      className={cn(
        "app-panel app-canvas relative overflow-hidden rounded-[var(--radius-xxl)] px-6 py-8 sm:px-8 sm:py-10",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-100",
          toneStyle.orbit
        )}
      />
      <div className="relative mx-auto flex max-w-2xl flex-col items-start gap-6">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-[var(--radius-large)] shadow-[var(--shadow-elevation-1)]",
              toneStyle.iconWrap
            )}
          >
            <Icon className={cn("h-6 w-6", spinning ? "animate-spin" : "")} />
          </div>
          <div className={cn("rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]", toneStyle.badge)}>
            {eyebrow}
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="brand-display text-3xl font-semibold leading-tight text-text-primary sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-xl text-sm leading-7 text-text-secondary sm:text-base">
            {description}
          </p>
        </div>

        {primaryAction || secondaryAction ? (
          <div className="flex flex-wrap items-center gap-3">
            {primaryAction ? renderAction(primaryAction) : null}
            {secondaryAction ? renderAction(secondaryAction) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

type DishImageProps = {
  imageUrl?: string | null;
  fallbackImageUrl?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  iconClassName?: string;
};

export function DishImage({
  imageUrl,
  fallbackImageUrl,
  alt,
  className,
  imageClassName,
  fallbackClassName,
  iconClassName,
}: DishImageProps) {
  const sources = useMemo(
    () =>
      [...new Set([imageUrl, fallbackImageUrl].filter((src): src is string => Boolean(src)))],
    [imageUrl, fallbackImageUrl],
  );
  const sourceSignature = sources.join("|");
  const [failureState, setFailureState] = useState<{
    signature: string;
    failedSources: string[];
  }>({
    signature: "",
    failedSources: [],
  });

  const failedSources =
    failureState.signature === sourceSignature
      ? new Set(failureState.failedSources)
      : new Set<string>();
  const activeSource = sources.find((source) => !failedSources.has(source)) ?? null;

  if (!activeSource) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(250,204,21,0.18),rgba(249,115,22,0.1))] text-muted-foreground/40",
          className,
          fallbackClassName,
        )}
      >
        <UtensilsCrossed className={cn("h-8 w-8", iconClassName)} />
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- menu media can come from dynamic URLs and needs runtime fallback cycling */}
      <img
        src={activeSource}
        alt={alt}
        className={cn("h-full w-full object-cover", imageClassName)}
        onError={() => {
          setFailureState((current) => {
            const currentFailures =
              current.signature === sourceSignature ? current.failedSources : [];

            if (currentFailures.includes(activeSource)) {
              return current;
            }

            return {
              signature: sourceSignature,
              failedSources: [...currentFailures, activeSource],
            };
          });
        }}
      />
    </div>
  );
}

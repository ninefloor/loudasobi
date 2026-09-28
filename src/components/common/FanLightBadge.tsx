"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { fanLightHex, normalizeFanLightColor } from "@/lib/fanlights";

export function FanLightBadge({
  color,
  compact = false,
}: {
  color?: string;
  compact?: boolean;
}) {
  const t = useTranslations();
  const hex = fanLightHex(color);
  const name = normalizeFanLightColor(color) ?? color;
  if (!compact)
    return (
      <span
        className="flex min-w-0 flex-col items-center gap-1 rounded-lg border px-2 py-1.5"
        style={
          hex
            ? {
                backgroundColor: `color-mix(in srgb, ${hex} 12%, var(--background))`,
                borderColor: `color-mix(in srgb, ${hex} 45%, var(--border))`,
              }
            : undefined
        }
        aria-label={`${t("fanlightColor")}: ${name || t("fanlightUnset")}`}
      >
        <Badge
          variant="outline"
          aria-hidden="true"
          className="h-[clamp(1.25rem,4cqi,1.75rem)] w-[clamp(1.75rem,6cqi,2.5rem)] rounded-lg border-black/15 dark:border-white/25"
          style={{
            backgroundColor: hex,
            boxShadow: hex ? `0 0 10px ${hex}33` : undefined,
          }}
        />
        <span className="max-w-full break-words text-center text-[clamp(0.5625rem,0.5rem+0.3125cqi,0.6875rem)] font-medium leading-tight text-muted-foreground">
          {name || t("fanlightUnset")}
        </span>
      </span>
    );
  return (
    <Badge
      variant="outline"
      aria-label={`${t("fanlightColor")}: ${name || t("fanlightUnset")}`}
      className="h-6 max-w-full gap-2 rounded-lg px-2 text-[10px] text-foreground"
      style={
        hex
          ? {
              backgroundColor: `color-mix(in srgb, ${hex} 12%, var(--background))`,
              borderColor: `color-mix(in srgb, ${hex} 45%, var(--border))`,
            }
          : undefined
      }
    >
      {hex && (
        <span
          aria-hidden="true"
          className="size-3 shrink-0 rounded-full border border-black/20"
          style={{
            backgroundColor: hex,
          }}
        />
      )}
      <span className="min-w-0">
        <span className="block truncate">{name || t("fanlightUnset")}</span>
      </span>
    </Badge>
  );
}

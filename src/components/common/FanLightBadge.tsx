"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { fanLightHex, normalizeFanLightColor } from "@/lib/fanlights";
import { cn } from "@/lib/utils";

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
  return (
    <Badge
      variant="outline"
      aria-label={`${t("fanlightColor")}: ${name || t("fanlightUnset")}`}
      className={cn(
        "max-w-full gap-2 rounded-lg text-foreground",
        compact ? "h-6 px-2 text-[10px]" : "h-auto px-3 py-2",
      )}
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
          className={cn(
            "shrink-0 rounded-full border border-black/20",
            compact ? "size-3" : "size-6",
          )}
          style={{
            backgroundColor: hex,
            boxShadow: compact ? undefined : `0 0 12px ${hex}66`,
          }}
        />
      )}
      <span className="min-w-0">
        {!compact && (
          <span className="block text-[10px] font-normal text-muted-foreground">
            {t("fanlightColor")}
          </span>
        )}
        <span className="block truncate">{name || t("fanlightUnset")}</span>
      </span>
    </Badge>
  );
}

"use client";

import { useId, useState } from "react";
import {
  Check,
  Languages,
  Monitor,
  Moon,
  Settings,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useSetLocale } from "@/i18n/LocaleProvider";
import { locales, localeNames } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export function SettingsMenu() {
  const t = useTranslations();
  const locale = useLocale();
  const setLocale = useSetLocale();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("settings")}>
          <Settings className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        aria-labelledby={`${id}-title`}
        className="max-h-[calc(100dvh-88px)] w-80 max-w-[calc(100vw-32px)] gap-0 overflow-y-auto p-0"
      >
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <div>
            <h2 id={`${id}-title`} className="font-semibold">
              {t("settings")}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("settingsHelp")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-1 shrink-0"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
        <Separator />
        <div className="space-y-5 p-4">
          <fieldset>
            <legend className="mb-1 flex items-center gap-2 text-sm font-semibold">
              <Languages className="size-4 text-muted-foreground" aria-hidden />
              {t("language")}
            </legend>
            <p
              id={`${id}-language-help`}
              className="mb-3 text-xs leading-relaxed text-muted-foreground"
            >
              {t("languageHelp")}
            </p>
            <div className="space-y-1.5">
              {locales.map((value) => (
                <label key={value} className="relative block cursor-pointer">
                  <input
                    type="radio"
                    name={`${id}-language`}
                    value={value}
                    checked={locale === value}
                    onChange={() => setLocale(value)}
                    aria-describedby={`${id}-language-help`}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-11 items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:font-medium peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background">
                    <span lang={value}>{localeNames[value]}</span>
                    <Check
                      aria-hidden
                      className={`size-4 text-primary ${locale === value ? "visible" : "invisible"}`}
                    />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Sun className="size-4 text-muted-foreground" aria-hidden />
              {t("theme")}
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "light", Icon: Sun },
                  { value: "dark", Icon: Moon },
                  { value: "system", Icon: Monitor },
                ] as const
              ).map(({ value, Icon }) => (
                <label key={value} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name={`${id}-theme`}
                    value={value}
                    checked={theme === value}
                    onChange={() => setTheme(value)}
                    className="peer sr-only"
                  />
                  <span className="flex h-full min-h-20 flex-col items-center justify-center gap-2 rounded-md border px-1 py-3 text-center text-xs transition-colors hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:font-medium peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background">
                    <Icon className="size-5" aria-hidden />
                    {t(value)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { Menu, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useSetLocale } from "@/i18n/LocaleProvider";
import { locales, localeNames } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { theme, setTheme } = useTheme();
  const t = useTranslations();
  const locale = useLocale();
  const setLocale = useSetLocale();
  return (
    <header className="grid h-14 shrink-0 grid-cols-[40px_1fr_40px] items-center border-b bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("toggleSongs")}
        onClick={onToggleSidebar}
      >
        <Menu className="size-5" />
      </Button>
      <span
        className="justify-self-center text-xl font-bold tracking-tight"
        aria-label="loudasobi"
      >
        loudasobi
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t("settings")}>
            <Settings className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={locale} onValueChange={setLocale}>
            {locales.map((value) => (
              <DropdownMenuRadioItem key={value} value={value} lang={value}>
                {localeNames[value]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuLabel>{t("theme")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light">
              {t("light")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              {t("dark")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              {t("system")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

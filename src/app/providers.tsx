"use client";

import { BrowserThemeColor } from "@/components/layout/BrowserThemeColor";
import { Provider } from "jotai";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";

export function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <BrowserThemeColor />
      <LocaleProvider initialLocale={locale}>
        <Provider>{children}</Provider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

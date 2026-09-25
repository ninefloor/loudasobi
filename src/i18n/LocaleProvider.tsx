"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { isLocale, localeCookie, type Locale } from "./config";
import { messages } from "./messages";

const LocaleSetter = createContext<(value: string) => void>(() => {});
export const useSetLocale = () => useContext(LocaleSetter);
export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState(initialLocale);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  function changeLocale(value: string) {
    if (!isLocale(value)) return;
    setLocale(value);
    document.cookie = `${localeCookie}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  }
  return (
    <LocaleSetter.Provider value={changeLocale}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages[locale]}
        timeZone="Asia/Seoul"
      >
        {children}
      </NextIntlClientProvider>
    </LocaleSetter.Provider>
  );
}

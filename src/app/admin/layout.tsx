"use client";

import { NextIntlClientProvider } from "next-intl";
import { messages } from "@/i18n/messages";

// Admin copy is Korean; shared preview/player components use the same locale.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider
      locale="ko"
      messages={messages.ko}
      timeZone="Asia/Seoul"
    >
      <div lang="ko" className="contents">
        {children}
      </div>
    </NextIntlClientProvider>
  );
}

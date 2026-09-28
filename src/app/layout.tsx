import { getRequestLocale } from "@/i18n/server";
import { localizedMetadata, siteViewport } from "@/lib/metadata";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "./providers";

export async function generateMetadata() {
  return localizedMetadata(await getRequestLocale());
}
export const viewport = siteViewport;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getRequestLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased">
        <Providers locale={locale}>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}

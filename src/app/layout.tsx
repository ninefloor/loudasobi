import { localizedMetadata, siteViewport } from "@/lib/metadata";
import { Providers } from "./providers";
import "./globals.css";
import { getRequestLocale } from "@/i18n/server";

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
      </body>
    </html>
  );
}

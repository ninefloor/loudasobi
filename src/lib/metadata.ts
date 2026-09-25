import type { Metadata, Viewport } from "next";
import type { Locale } from "@/i18n/config";

const description =
  "YOASOBI 노래의 가사와 함께 박수, 콜, 떼창을 연습하는 팬 가이드";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const siteMetadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: { default: "loudasobi", template: "%s | loudasobi" },
  description,
  applicationName: "loudasobi",
  ...(siteUrl ? { alternates: { canonical: "/" } } : {}),
  openGraph: {
    title: "loudasobi",
    description,
    siteName: "loudasobi",
    locale: "ko_KR",
    type: "website",
    ...(siteUrl ? { url: "/" } : {}),
  },
  twitter: { card: "summary_large_image", title: "loudasobi", description },
};

export function localizedMetadata(locale: Locale): Metadata {
  const descriptions = {
    ko: description,
    ja: "YOASOBIの歌詞に合わせて手拍子・コール・一緒に歌うパートを練習するファンガイド",
    en: "A fan guide to practicing claps, calls, and sing-along parts with YOASOBI lyrics",
  };
  const translated = descriptions[locale];
  return {
    ...siteMetadata,
    description: translated,
    openGraph: {
      ...siteMetadata.openGraph,
      description: translated,
      locale: { ko: "ko_KR", ja: "ja_JP", en: "en_US" }[locale],
    },
    twitter: { ...siteMetadata.twitter, description: translated },
  };
}

export const siteViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function BrowserThemeColor() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (!resolvedTheme) return;
    const color = resolvedTheme === "dark" ? "#0A0A0A" : "#FAFAFA";
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => {
        meta.content = color;
      });
  }, [resolvedTheme]);
  return null;
}

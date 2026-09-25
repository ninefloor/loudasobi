export const locales = ["ko", "ja", "en"] as const;
export type Locale = (typeof locales)[number];
export const localeNames: Record<Locale, string> = {
  ko: "한국어",
  ja: "日本語",
  en: "English",
};
export const localeCookie = "loudasobi_locale";
export function isLocale(value: unknown): value is Locale {
  return locales.some((locale) => locale === value);
}
export function resolveLocale(saved?: string, accepted = ""): Locale {
  if (isLocale(saved)) return saved;
  const languages = accepted
    .split(",")
    .map((entry) => {
      const [tag, quality] = entry.trim().toLowerCase().split(";");
      return {
        locale: tag.split("-")[0],
        quality: quality ? Number(quality.trim().replace(/^q=/, "")) : 1,
      };
    })
    .filter((entry) => entry.quality > 0 && entry.quality <= 1)
    .sort((a, b) => b.quality - a.quality);
  return (
    (languages.find((entry) => isLocale(entry.locale))?.locale as
      Locale | undefined) ?? "ko"
  );
}

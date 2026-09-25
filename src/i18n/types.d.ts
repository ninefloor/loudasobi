import type { Locale } from "./config";
import type { messages } from "./messages";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages.ko;
  }
}

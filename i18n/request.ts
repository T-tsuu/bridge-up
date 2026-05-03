import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale must be awaited in v4
  const requested = await requestLocale;

  // Fall back to default if locale is missing or unsupported
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale, // ← required in v4, this is what was missing
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
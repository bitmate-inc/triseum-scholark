import { defineRouting } from "next-intl/routing";

const localeList = ["en", "es"] as const;

export const routing = defineRouting({
	locales: localeList,
	defaultLocale: "en",
	localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export function isLocale(value: string): value is Locale {
	return routing.locales.some((locale) => locale === value);
}
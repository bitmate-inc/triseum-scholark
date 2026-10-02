import { getRequestConfig } from "next-intl/server";

import { type Locale, routing } from "./routing";

type Messages = typeof import("../messages/en.json");

const messagesByLocale: Record<Locale, () => Promise<Messages>> = {
	en: async () => (await import("../messages/en.json")).default,
	es: async () => (await import("../messages/es.json")).default,
};

export default getRequestConfig(async ({ requestLocale }) => {
	const requestedLocale = await requestLocale;
	const locale = routing.locales.find(
		(supportedLocale) => supportedLocale === requestedLocale,
	) ?? routing.defaultLocale;

	return {
		locale,
		messages: await messagesByLocale[locale](),
	};
});
import "../../asset/style/globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
	getMessages,
	getTranslations,
	setRequestLocale
} from "next-intl/server";

import { StoreProvider } from "../../feature/api/client/provider/store-provider";
import { SiteFooter } from "../../feature/layout/shared/component/site-footer";
import { SiteHeader } from "../../feature/layout/shared/component/site-header";
import { routing } from "../../i18n/routing";

const geistSans = localFont({
	src: "../../asset/font/geist-vf.woff",
	variable: "--font-geist-sans",
});
const geistMono = localFont({
	src: "../../asset/font/geist-mono-vf.woff",
	variable: "--font-geist-mono",
});

export const dynamicParams = false;

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale: requestedLocale } = await params;
	const locale = routing.locales.find(
		(supportedLocale) => supportedLocale === requestedLocale,
	);

	if (!locale) notFound();

	const translate = await getTranslations({ locale, namespace: "metadata" });

	return {
		title: translate("title"),
		description: translate("description"),
		icons: {
			icon: "/favicon.ico",
		},
	};
}

export default async function RootLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}>) {
	const { locale: requestedLocale } = await params;
	const locale = routing.locales.find(
		(supportedLocale) => supportedLocale === requestedLocale,
	);

	if (!locale) notFound();

	setRequestLocale(locale);
	const messages = await getMessages();

	return (
		<html lang={locale}>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<NextIntlClientProvider messages={messages}>
					<StoreProvider>
						<SiteHeader/>
						{children}
						<SiteFooter/>
					</StoreProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}

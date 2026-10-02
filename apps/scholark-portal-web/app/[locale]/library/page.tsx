import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { getPathname } from "../../../i18n/navigation";
import { isLocale } from "../../../i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale } = await params;
	if (!isLocale(locale)) notFound();
	const t = await getTranslations({ locale, namespace: "metadata" });
	return { title: t("libraryTitle"), description: t("libraryDescription") };
}

export default async function LibraryPage() {
	const locale = await getLocale();
	redirect(getPathname({ locale, href: "/library/classroom" }));
}
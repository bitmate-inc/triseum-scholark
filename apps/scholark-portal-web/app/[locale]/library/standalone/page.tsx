import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { isLocale } from "../../../../i18n/routing";
import { LibraryPageContent } from "../library-page-content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale } = await params;
	if (!isLocale(locale)) notFound();
	const t = await getTranslations({ locale, namespace: "metadata" });
	return { title: t("standaloneLibraryTitle"), description: t("standaloneLibraryDescription") };
}

export default function StandaloneLibraryPage() {
	return <LibraryPageContent mode="standalone"/>;
}
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PublisherDashboard } from "../../../feature/publisher/client/component/publisher-dashboard";
import { isLocale } from "../../../i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale } = await params;
	if (!isLocale(locale)) notFound();
	const t = await getTranslations({ locale, namespace: "metadata" });
	return { title: t("publisherTitle"), description: t("publisherDescription") };
}

export default function PublisherPage() {
	return <PublisherDashboard/>;
}
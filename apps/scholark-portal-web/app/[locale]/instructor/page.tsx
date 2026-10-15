import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { InstructorDashboard } from "../../../feature/instructor/client/component/instructor-dashboard";
import { isLocale } from "../../../i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale } = await params;
	if (!isLocale(locale)) notFound();
	const t = await getTranslations({ locale, namespace: "metadata" });
	return { title: t("instructorTitle"), description: t("instructorDescription") };
}

export default function InstructorPage() {
	return <InstructorDashboard/>;
}
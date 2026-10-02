import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import styles from "../../../asset/style/site.module.css";
import { AcademicSearch } from "../../../feature/catalog/client/component/academic-search";
import { getInstitutionListRequest } from "../../../feature/catalog/server/request/education.request";
import { isLocale } from "../../../i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale } = await params;
	if (!isLocale(locale)) notFound();
	const t = await getTranslations({ locale, namespace: "metadata" });
	return { title: t("institutionsTitle"), description: t("institutionsDescription") };
}

export default async function InstitutionCatalogPage() {
	const t = await getTranslations("academicPages");
	const response = await getInstitutionListRequest();

	return (
		<main className={styles.catalogPage}>
			<header className={styles.catalogIntro}>
				<p className={styles.kicker}>{t("institutionsKicker")}</p>
				<h1>{t("institutionsHeading")}</h1>
				<p>{t("institutionsDescription")}</p>
			</header>
			<AcademicSearch resource="institution" initialItemList={response.institutionList} initialTotalItemCount={response.totalItemCount}/>
		</main>
	);
}
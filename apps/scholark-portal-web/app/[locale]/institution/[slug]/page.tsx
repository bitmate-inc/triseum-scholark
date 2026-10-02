import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import styles from "../../../../asset/style/site.module.css";
import { AcademicSearch } from "../../../../feature/catalog/client/component/academic-search";
import {
	getClassroomListRequest,
	getCourseListRequest,
	getInstitutionRequest
} from "../../../../feature/catalog/server/request/education.request";
import { AcademicMasthead } from "../../../../feature/catalog/shared/component/academic-masthead";
import { isLocale } from "../../../../i18n/routing";

type InstitutionPageProps = { params: Promise<{ slug: string; locale: string }> };

export async function generateMetadata({ params }: InstitutionPageProps): Promise<Metadata> {
	const { slug, locale } = await params;
	if (!isLocale(locale)) notFound();
	const [institution, t] = await Promise.all([
		getInstitutionRequest(slug),
		getTranslations({ locale, namespace: "metadata" }),
	]);
	return institution ? { title: t("detailTitle", { title: institution.name }), description: institution.summary } : {};
}

export default async function InstitutionPage({ params }: InstitutionPageProps) {
	const { slug } = await params;
	const t = await getTranslations("academicPages");
	const institution = await getInstitutionRequest(slug);
	if (!institution) notFound();

	const [courseResponse, classroomResponse] = await Promise.all([
		getCourseListRequest({ institutionId: institution.id }),
		getClassroomListRequest({ institutionId: institution.id }),
	]);

	return (
		<main className={styles.gamePage}>
			<AcademicMasthead item={institution} resource="institution" backHref="/institution" backLabel={t("allInstitutions")}/>
			<section className={styles.academicSection}>
				<div className={styles.sectionHeading}><div><p className={styles.kicker}>{t("curriculum")}</p><h2>{t("courses")}</h2></div></div>
				<AcademicSearch resource="course" filters={{ institutionId: institution.id }} initialItemList={courseResponse.courseList} initialTotalItemCount={courseResponse.totalItemCount}/>
			</section>
			<section className={styles.academicSection}>
				<div className={styles.sectionHeading}><div><p className={styles.kicker}>{t("activeLearningSpaces")}</p><h2>{t("classrooms")}</h2></div></div>
				<AcademicSearch resource="classroom" filters={{ institutionId: institution.id }} initialItemList={classroomResponse.classroomList} initialTotalItemCount={classroomResponse.totalItemCount}/>
			</section>
		</main>
	);
}
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import styles from "../../../../asset/style/site.module.css";
import { AcademicSearch } from "../../../../feature/catalog/client/component/academic-search";
import { getClassroomListRequest, getCourseRequest } from "../../../../feature/catalog/server/request/education.request";
import { AcademicMasthead } from "../../../../feature/catalog/shared/component/academic-masthead";
import { isLocale } from "../../../../i18n/routing";

type CoursePageProps = { params: Promise<{ slug: string; locale: string }> };

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
	const { slug, locale } = await params;
	if (!isLocale(locale)) notFound();
	const [course, t] = await Promise.all([
		getCourseRequest(slug),
		getTranslations({ locale, namespace: "metadata" }),
	]);
	return course ? { title: t("detailTitle", { title: course.name }), description: course.summary } : {};
}

export default async function CoursePage({ params }: CoursePageProps) {
	const { slug } = await params;
	const t = await getTranslations("academicPages");
	const course = await getCourseRequest(slug);
	if (!course) notFound();

	const classroomResponse = await getClassroomListRequest({ courseId: course.id });

	return (
		<main className={styles.gamePage}>
			<AcademicMasthead item={course} resource="course" backHref={`/institution/${course.institution.slug}`} backLabel={course.institution.name}/>
			<section className={styles.academicSection}>
				<div className={styles.sectionHeading}><div><p className={styles.kicker}>{t("learningSpaces")}</p><h2>{t("classrooms")}</h2></div></div>
				<AcademicSearch resource="classroom" filters={{ courseId: course.id }} initialItemList={classroomResponse.classroomList} initialTotalItemCount={classroomResponse.totalItemCount}/>
			</section>
		</main>
	);
}
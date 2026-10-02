import { UserRound } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import styles from "../../../../asset/style/site.module.css";
import { ClassroomGameList } from "../../../../feature/catalog/client/component/classroom-game-list";
import { getClassroomGameListRequest, getClassroomRequest } from "../../../../feature/catalog/server/request/education.request";
import { AcademicMasthead } from "../../../../feature/catalog/shared/component/academic-masthead";
import { isLocale } from "../../../../i18n/routing";

type ClassroomPageProps = { params: Promise<{ slug: string; locale: string }> };

export async function generateMetadata({ params }: ClassroomPageProps): Promise<Metadata> {
	const { slug, locale } = await params;
	if (!isLocale(locale)) notFound();
	const [classroom, t] = await Promise.all([
		getClassroomRequest(slug),
		getTranslations({ locale, namespace: "metadata" }),
	]);
	return classroom ? { title: t("detailTitle", { title: classroom.name }), description: classroom.summary } : {};
}

export default async function ClassroomPage({ params }: ClassroomPageProps) {
	const { slug } = await params;
	const t = await getTranslations("academicPages");
	const classroom = await getClassroomRequest(slug);
	if (!classroom) notFound();
	const instructorList = classroom.instructorList ?? [];

	const { classroomGameList } = await getClassroomGameListRequest({ classroomId: classroom.id });

	return (
		<main className={styles.gamePage}>
			<AcademicMasthead item={classroom} resource="classroom" backHref={`/institution/${classroom.institution.slug}`} backLabel={classroom.institution.name}/>
			{instructorList.length ? (
				<section className={styles.instructorSection}>
					<div><p className={styles.kicker}>{t("teachingTeam")}</p><h2>{t("instructors")}</h2></div>
					<ul className={styles.instructorList}>
						{instructorList.slice(0, 4).map((instructor) => (
							<li key={instructor.id}><UserRound aria-hidden="true"/><span>{instructor.name}</span></li>
						))}
					</ul>
				</section>
			) : null}
			<section className={styles.academicSection}>
				<div className={styles.sectionHeading}>
					<div><p className={styles.kicker}>{t("assignedExperiences")}</p><h2>{t("classroomGames")}</h2></div>
					<span>{t("gameCount", { count: classroomGameList.length })}</span>
				</div>
				{classroomGameList.length ? (
					<ClassroomGameList classroomGameList={classroomGameList}/>
				) : (
					<div className={styles.emptyState}><h3>{t("noGamesAssigned")}</h3><p>{t("noGamesAssignedDescription")}</p></div>
				)}
			</section>
		</main>
	);
}
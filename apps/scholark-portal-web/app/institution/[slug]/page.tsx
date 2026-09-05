import type { Metadata } from "next";
import { notFound } from "next/navigation";

import styles from "../../../asset/style/site.module.css";
import { AcademicSearch } from "../../../feature/catalog/client/component/academic-search";
import {
	getClassroomListRequest,
	getCourseListRequest,
	getInstitutionRequest
} from "../../../feature/catalog/server/request/education.request";
import { AcademicMasthead } from "../../../feature/catalog/shared/component/academic-masthead";

type InstitutionPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: InstitutionPageProps): Promise<Metadata> {
	const institution = await getInstitutionRequest((await params).slug);
	return institution ? { title: `${institution.name} · ScholArk`, description: institution.summary } : {};
}

export default async function InstitutionPage({ params }: InstitutionPageProps) {
	const institution = await getInstitutionRequest((await params).slug);
	if (!institution) notFound();

	const [courseResponse, classroomResponse] = await Promise.all([
		getCourseListRequest({ institutionId: institution.id }),
		getClassroomListRequest({ institutionId: institution.id }),
	]);

	return (
		<main className={styles.gamePage}>
			<AcademicMasthead item={institution} resource="institution" backHref="/institution" backLabel="All institutions"/>
			<section className={styles.academicSection}>
				<div className={styles.sectionHeading}><div><p className={styles.kicker}>Curriculum</p><h2>Courses</h2></div></div>
				<AcademicSearch resource="course" filters={{ institutionId: institution.id }} initialItemList={courseResponse.courseList} initialTotalItemCount={courseResponse.totalItemCount} label="Courses"/>
			</section>
			<section className={styles.academicSection}>
				<div className={styles.sectionHeading}><div><p className={styles.kicker}>Active learning spaces</p><h2>Classrooms</h2></div></div>
				<AcademicSearch resource="classroom" filters={{ institutionId: institution.id }} initialItemList={classroomResponse.classroomList} initialTotalItemCount={classroomResponse.totalItemCount} label="Classrooms"/>
			</section>
		</main>
	);
}
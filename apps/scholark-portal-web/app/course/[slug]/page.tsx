import type { Metadata } from "next";
import { notFound } from "next/navigation";

import styles from "../../../asset/style/site.module.css";
import { AcademicSearch } from "../../../feature/catalog/client/component/academic-search";
import { getClassroomListRequest, getCourseRequest } from "../../../feature/catalog/server/request/education.request";
import { AcademicMasthead } from "../../../feature/catalog/shared/component/academic-masthead";

type CoursePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
	const course = await getCourseRequest((await params).slug);
	return course ? { title: `${course.name} · ScholArk`, description: course.summary } : {};
}

export default async function CoursePage({ params }: CoursePageProps) {
	const course = await getCourseRequest((await params).slug);
	if (!course) notFound();

	const classroomResponse = await getClassroomListRequest({ courseId: course.id });

	return (
		<main className={styles.gamePage}>
			<AcademicMasthead item={course} resource="course" backHref={`/institution/${course.institution.slug}`} backLabel={course.institution.name}/>
			<section className={styles.academicSection}>
				<div className={styles.sectionHeading}><div><p className={styles.kicker}>Learning spaces</p><h2>Classrooms</h2></div></div>
				<AcademicSearch resource="classroom" filters={{ courseId: course.id }} initialItemList={classroomResponse.classroomList} initialTotalItemCount={classroomResponse.totalItemCount} label="Classrooms"/>
			</section>
		</main>
	);
}
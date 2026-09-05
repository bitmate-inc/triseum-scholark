import type { Metadata } from "next";
import { notFound } from "next/navigation";

import styles from "../../../asset/style/site.module.css";
import { getClassroomGameListRequest, getClassroomRequest } from "../../../feature/catalog/server/request/education.request";
import { AcademicMasthead } from "../../../feature/catalog/shared/component/academic-masthead";
import { GameCard } from "../../../feature/catalog/shared/component/game-card";

type ClassroomPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ClassroomPageProps): Promise<Metadata> {
	const classroom = await getClassroomRequest((await params).slug);
	return classroom ? { title: `${classroom.name} · ScholArk`, description: classroom.summary } : {};
}

export default async function ClassroomPage({ params }: ClassroomPageProps) {
	const classroom = await getClassroomRequest((await params).slug);
	if (!classroom) notFound();

	const { classroomGameList } = await getClassroomGameListRequest({ classroomId: classroom.id });

	return (
		<main className={styles.gamePage}>
			<AcademicMasthead item={classroom} resource="classroom" backHref={`/institution/${classroom.institution.slug}`} backLabel={classroom.institution.name}/>
			<section className={styles.academicSection}>
				<div className={styles.sectionHeading}>
					<div><p className={styles.kicker}>Assigned experiences</p><h2>Classroom games</h2></div>
					<span>{classroomGameList.length.toString().padStart(2, "0")} games</span>
				</div>
				{classroomGameList.length ? (
					<div className={styles.gameGrid}>{classroomGameList.map(({ game }) => <GameCard game={game} key={game.id}/>)}</div>
				) : (
					<div className={styles.emptyState}><h3>No games assigned</h3><p>This classroom does not have any published games yet.</p></div>
				)}
			</section>
		</main>
	);
}
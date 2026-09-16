import { buttonVariants } from "@repo/ui/button";
import { CheckCircle2, Library } from "lucide-react";
import Link from "next/link";

import styles from "../../../../asset/style/acquisition.module.css";
import type { ClassroomGame } from "../../../catalog/shared/model/education";

export function ClassroomGameAcquisitionSuccess({ classroomGame }: { classroomGame: ClassroomGame }) {
	return (
		<main className={styles.page}>
			<CheckCircle2 className={styles.successIcon} aria-hidden="true"/>
			<p className={styles.kicker}>Classroom acquisition complete</p>
			<h1>{classroomGame.game.title} is in your library.</h1>
			<p className={styles.detail}>Your license is linked to {classroomGame.classroom.name}, so your progress can be used for this classroom.</p>
			<div className={styles.actions}>
				<Link className={buttonVariants({ size: "lg" })} href="/library"><Library data-icon="inline-start"/>Go to your library</Link>
				<Link className={buttonVariants({ variant: "outline" })} href={`/classroom/${classroomGame.classroom.slug}`}>Return to classroom</Link>
			</div>
		</main>
	);
}
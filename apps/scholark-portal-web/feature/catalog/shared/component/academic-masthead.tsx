import { Badge } from "@repo/ui/badge";
import { ArrowLeft, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import styles from "../../../../asset/style/site.module.css";
import type {
	AcademicItem,
	AcademicResource,
	Classroom,
	Course
} from "../model/education";

type AcademicMastheadProps = {
	item: AcademicItem;
	resource: AcademicResource;
	backHref: string;
	backLabel: string;
};

export function AcademicMasthead({ item, resource, backHref, backLabel }: AcademicMastheadProps) {
	const course = resource === "course" ? item as Course : undefined;
	const classroom = resource === "classroom" ? item as Classroom : undefined;
	const institutionName = course?.institution.name ?? classroom?.institution.name;

	return (
		<>
			<Link className={styles.backLink} href={backHref}><ArrowLeft aria-hidden="true"/>{backLabel}</Link>
			<section className={styles.gameMasthead}>
				<div className={styles.gameCover}>
					{item.cover ? <Image src={item.cover.src} alt={item.cover.alt} fill priority sizes="(max-width: 800px) 100vw, 56vw"/> : null}
				</div>
				<div className={styles.gameSummary}>
					<p className={styles.eyebrow}>{resource === "institution" ? "Educational institution" : resource}</p>
					<h1>{item.name}</h1>
					<p className={styles.gameLead}>{item.summary}</p>
					<div className={styles.tagRow}>
						{"code" in item ? <Badge variant="secondary">{item.code}</Badge> : null}
					</div>
					{institutionName ? (
						<dl className={styles.gameFacts}>
							<div><dt><Building2 aria-hidden="true"/> Institution</dt><dd>{institutionName}</dd></div>
						</dl>
					) : null}
				</div>
			</section>
			<section className={styles.aboutGame}>
				<p className={styles.kicker}>About this {resource}</p>
				<p>{item.description ?? `More information about this ${resource} is coming soon.`}</p>
			</section>
		</>
	);
}
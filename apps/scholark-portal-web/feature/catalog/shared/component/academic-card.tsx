import { Badge } from "@repo/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/card";
import {
	ArrowUpRight,
	BookOpen,
	Building2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import styles from "../../../../asset/style/site.module.css";
import type {
	AcademicItem,
	AcademicResource,
	Classroom,
	Course
} from "../model/education";

type AcademicCardProps = {
	item: AcademicItem;
	resource: AcademicResource;
};

export function AcademicCard({ item, resource }: AcademicCardProps) {
	const course = resource === "course" ? item as Course : undefined;
	const classroom = resource === "classroom" ? item as Classroom : undefined;
	const eyebrow = course?.code
		?? classroom?.code
		?? (resource === "institution" ? "Institution" : resource);
	const meta = course?.institution.name
		?? classroom?.institution.name
		?? "Explore courses and classrooms";

	return (
		<Link className={styles.cardLink} href={`/${resource}/${item.slug}`}>
			<Card className={styles.gameCard}>
				<div className={styles.cardImage}>
					{item.cover ? <Image src={item.cover.src} alt="" fill sizes="(max-width: 760px) 100vw, 33vw"/> : null}
					<span className={styles.cardArrow} aria-hidden="true"><ArrowUpRight/></span>
				</div>
				<CardHeader>
					<p className={styles.eyebrow}>{eyebrow}</p>
					<CardTitle className={styles.cardTitle}>{item.name}</CardTitle>
					<CardDescription className={styles.cardDescription}>{item.summary}</CardDescription>
				</CardHeader>
				{classroom?.taxonomyTermList.length ? (
					<CardContent className={styles.tagRow}>
						{classroom.taxonomyTermList.slice(0, 2).map((term) => (
							<Badge key={term.id} variant="secondary">{term.label}</Badge>
						))}
					</CardContent>
				) : null}
				<CardFooter className={styles.cardMeta}>
					{resource === "institution" ? <Building2 aria-hidden="true"/> : <BookOpen aria-hidden="true"/>}
					{meta}
				</CardFooter>
			</Card>
		</Link>
	);
}
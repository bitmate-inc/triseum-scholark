"use client";

import { Badge } from "@repo/ui/badge";
import { buttonVariants } from "@repo/ui/button";
import {
	CheckCircle2,
	Clock3,
	MonitorPlay
} from "lucide-react";
import Link from "next/link";

import styles from "../../../../asset/style/site.module.css";
import { useAuthGetSessionQuery } from "../../../api/client/api/generated-api";
import { formatMoney } from "../../../commerce/shared/model/money";
import { useGetUserLibraryQuery } from "../../../library/client/api/library-api";
import type { ClassroomGame } from "../../shared/model/education";
import { formatEstimatedLength, getGameTagList } from "../../shared/model/game";

function formatDateTime(value: string): string {
	return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function ClassroomGameList({ classroomGameList }: { classroomGameList: ClassroomGame[] }) {
	const session = useAuthGetSessionQuery();
	const library = useGetUserLibraryQuery(undefined, { skip: !session.data });
	const licenseStateReady = !session.isLoading && (!session.data || (!library.isLoading && !library.error));

	return (
		<div className={styles.classroomGameList}>
			{classroomGameList.map((classroomGame) => {
				const licenseList = (library.data?.itemList ?? []).filter(
					(item) => item.game.id === classroomGame.game.id && item.gameVersion.id === classroomGame.gameVersionId && item.classroom?.id === classroomGame.classroom.id,
				);
				const activeLicense = licenseList.find((item) => item.isActive);

				return (
					<article className={styles.classroomGameItem} key={classroomGame.id}>
						<div className={styles.classroomGameMain}>
							<div className={styles.classroomGameHeading}>
								<div>
									<p className={styles.eyebrow}>{getGameTagList(classroomGame.game).join(" · ")}</p>
									<h3>{classroomGame.game.title}</h3>
								</div>
							</div>
							<p className={styles.classroomGameDescription}>{classroomGame.game.description ?? classroomGame.game.summary}</p>
							<div className={styles.classroomGameTags}>
								{getGameTagList(classroomGame.game).map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
								{classroomGame.game.price ? <Badge variant="default">{formatMoney(classroomGame.game.price)}</Badge> : null}
							</div>
							<div className={styles.classroomGameFacts}>
								<span><Clock3 aria-hidden="true"/>{formatEstimatedLength(classroomGame.game)}</span>
								<span>Valid {formatDateTime(classroomGame.startAt)} – {formatDateTime(classroomGame.endAt)}</span>
							</div>
						</div>
						<div className={styles.classroomGameAction}>
							{activeLicense ? <Badge><CheckCircle2 data-icon="inline-start"/>In Library</Badge> : licenseList.length ? <Badge variant="outline">In Library (Expired)</Badge> : null}
							{!activeLicense && licenseStateReady ? (
								<Link className={buttonVariants({ size: "sm" })} href={`/classroom-game/${classroomGame.id}/acquire`}>
									<MonitorPlay data-icon="inline-start"/>Acquire
								</Link>
							) : null}
						</div>
					</article>
				);
			})}
		</div>
	);
}
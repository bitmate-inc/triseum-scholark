import { Badge } from "@repo/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/card";
import { ArrowUpRight, Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import styles from "../../../../asset/style/site.module.css";
import {
	formatEstimatedLength,
	type Game,
	getGameEyebrow,
	getGameTagList,
} from "../model/game";

export function GameCard({ game }: { game: Game }) {
	return (
		<Link className={styles.cardLink} href={`/game/${game.slug}`}>
			<Card className={styles.gameCard}>
				<div className={styles.cardImage}>
					{game.cover ? <Image src={game.cover.src} alt="" fill sizes="(max-width: 760px) 100vw, 33vw"/> : null}
					<span className={styles.cardArrow} aria-hidden="true">
						<ArrowUpRight/>
					</span>
				</div>
				<CardHeader>
					<p className={styles.eyebrow}>{getGameEyebrow(game)}</p>
					<CardTitle className={styles.cardTitle}>{game.title}</CardTitle>
					<CardDescription className={styles.cardDescription}>
						{game.summary}
					</CardDescription>
				</CardHeader>
				<CardContent className={styles.tagRow}>
					{getGameTagList(game).slice(0, 2).map((tag) => (
						<Badge key={tag} variant="secondary">
							{tag}
						</Badge>
					))}
				</CardContent>
				<CardFooter className={styles.cardMeta}>
					<Clock3 aria-hidden="true"/>
					{formatEstimatedLength(game)}
				</CardFooter>
			</Card>
		</Link>
	);
}
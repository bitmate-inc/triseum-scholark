import { Badge } from "@repo/ui/badge";
import { Separator } from "@repo/ui/separator";
import {
	ArrowLeft,
	Building2,
	Clock3
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "../../../asset/style/site.module.css";
import { GameVersionList } from "../../../feature/catalog/client/component/game-version-list";
import { getGameRequest } from "../../../feature/catalog/server/request/get-game.request";
import { getGameListRequest } from "../../../feature/catalog/server/request/get-game-list.request";
import {
	formatEstimatedLength,
	getGameEyebrow,
	getGameTagList,
} from "../../../feature/catalog/shared/model/game";
import type { Media } from "../../../feature/media/shared/model/media";

type GamePageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
	const { gameList } = await getGameListRequest();
	return gameList.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
	const game = await getGameRequest((await params).slug);
	return game ? { title: `${game.title} · ScholArk`, description: game.summary } : {};
}

export default async function GamePage({ params }: GamePageProps) {
	const game = await getGameRequest((await params).slug);
	if (!game) notFound();

	const fallbackVideo: Media = {
		type: "video",
		src: "/game-trailer.mp4",
		alt: `${game.title} gameplay trailer`,
	};
	const mediaList = game.mediaList?.length
		? game.mediaList
		: game.cover ? [game.cover, fallbackVideo] : [fallbackVideo];

	return (
		<main className={styles.gamePage}>
			<Link className={styles.backLink} href="/catalog"><ArrowLeft aria-hidden="true"/>Back to catalog</Link>
			<section className={styles.gameMasthead}>
				<div className={styles.gameCover}>
					{game.cover ? <Image src={game.cover.src} alt="" fill priority sizes="(max-width: 800px) 100vw, 56vw"/> : null}
				</div>
				<div className={styles.gameSummary}>
					<p className={styles.eyebrow}>{getGameEyebrow(game)}</p>
					<h1>{game.title}</h1>
					<p className={styles.gameLead}>{game.summary}</p>
					<div className={styles.tagRow}>
						{getGameTagList(game).map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
					</div>
					<Separator/>
					<dl className={styles.gameFacts}>
						<div><dt><Clock3 aria-hidden="true"/> Typical length</dt><dd>{formatEstimatedLength(game)}</dd></div>
						{game.publisher ? (
							<div>
								<dt><Building2 aria-hidden="true"/> Publisher</dt>
								<dd>
									{game.publisher.websiteUrl ? (
										<a href={game.publisher.websiteUrl} rel="noreferrer" target="_blank">{game.publisher.name}</a>
									) : game.publisher.name}
								</dd>
							</div>
						) : null}
					</dl>
				</div>
			</section>
			<GameVersionList game={game}/>
			<section className={styles.aboutGame}>
				<p className={styles.kicker}>About this game</p>
				<p>{game.description ?? "More information about this game is coming soon."}</p>
			</section>
			<section className={styles.mediaSection}>
				<div className={styles.sectionHeading}>
					<div><p className={styles.kicker}>Inside the experience</p><h2>Media library</h2></div>
					<span>{mediaList.length.toString().padStart(2, "0")} captures</span>
				</div>
				<div className={styles.mediaGrid}>
					{mediaList.map((item, index) => (
						<figure className={styles.mediaItem} key={`${item.src}-${index}`}>
							{item.type === "image" ? (
								<Image src={item.src} alt={item.alt} fill sizes="(max-width: 800px) 100vw, 50vw"/>
							) : (
								<video controls preload="metadata" aria-label={item.alt}><source src={item.src} type="video/mp4"/></video>
							)}
							<figcaption>{String(index + 1).padStart(2, "0")} · {item.type}</figcaption>
						</figure>
					))}
				</div>
			</section>
		</main>
	);
}

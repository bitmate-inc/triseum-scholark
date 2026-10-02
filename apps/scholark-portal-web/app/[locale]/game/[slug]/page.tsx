import { Badge } from "@repo/ui/badge";
import { Separator } from "@repo/ui/separator";
import {
	ArrowLeft,
	Building2,
	Clock3
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import styles from "../../../../asset/style/site.module.css";
import { GameVersionList } from "../../../../feature/catalog/client/component/game-version-list";
import { getGameRequest } from "../../../../feature/catalog/server/request/get-game.request";
import { getGameListRequest } from "../../../../feature/catalog/server/request/get-game-list.request";
import {
	formatEstimatedLength,
	getGameEyebrow,
	getGameTagList,
} from "../../../../feature/catalog/shared/model/game";
import type { Media } from "../../../../feature/media/shared/model/media";
import { getPathname, Link } from "../../../../i18n/navigation";
import { isLocale, type Locale } from "../../../../i18n/routing";

type GamePageProps = {
	params: Promise<{ slug: string; locale: string }>;
	searchParams: Promise<{ returnTo?: string | string[] }>;
};

function getCatalogReturnUrl(value: string | string[] | undefined, locale: Locale): string {
	const catalogPath = getPathname({ locale, href: "/catalog" });
	const candidate = Array.isArray(value) ? value[0] : value;
	if (!candidate?.startsWith("/") || candidate.startsWith("//")) {
		return catalogPath;
	}

	try {
		const url = new URL(candidate, "https://scholark.invalid");
		if (url.origin !== "https://scholark.invalid" || url.pathname !== catalogPath) {
			return catalogPath;
		}

		return `${url.pathname}${url.search}`;
	} catch {
		return catalogPath;
	}
}

export async function generateStaticParams() {
	const { gameList } = await getGameListRequest();
	return gameList.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
	const { slug, locale } = await params;
	if (!isLocale(locale)) notFound();
	const [game, t] = await Promise.all([
		getGameRequest(slug),
		getTranslations({ locale, namespace: "metadata" }),
	]);
	return game ? { title: t("detailTitle", { title: game.title }), description: game.summary } : {};
}

export default async function GamePage({ params, searchParams }: GamePageProps) {
	const [{ slug, locale: requestedLocale }, query] = await Promise.all([params, searchParams]);
	if (!isLocale(requestedLocale)) notFound();
	const locale = requestedLocale;
	const [t, catalogT] = await Promise.all([
		getTranslations("gamePage"),
		getTranslations("catalog"),
	]);
	const game = await getGameRequest(slug);
	if (!game) notFound();
	const catalogReturnUrl = getCatalogReturnUrl(query.returnTo, locale);

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
			<Link className={styles.backLink} href={catalogReturnUrl}><ArrowLeft aria-hidden="true"/>{t("backToCatalog")}</Link>
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
						<div><dt><Clock3 aria-hidden="true"/> {t("typicalLength")}</dt><dd>{formatEstimatedLength(game, locale) ?? catalogT("lengthVaries")}</dd></div>
						{game.publisher ? (
							<div>
								<dt><Building2 aria-hidden="true"/> {t("publisher")}</dt>
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
				<p className={styles.kicker}>{t("aboutGame")}</p>
				<p>{game.description ?? t("gameMoreInfo")}</p>
			</section>
			<section className={styles.mediaSection}>
				<div className={styles.sectionHeading}>
					<div><p className={styles.kicker}>{t("insideExperience")}</p><h2>{t("mediaLibrary")}</h2></div>
					<span>{t("mediaCount", { count: mediaList.length })}</span>
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

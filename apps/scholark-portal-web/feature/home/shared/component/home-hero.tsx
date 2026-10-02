import { Badge } from "@repo/ui/badge";
import { buttonVariants } from "@repo/ui/button";
import {
	ArrowRight,
	GraduationCap,
	Play
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import styles from "../../../../asset/style/site.module.css";
import { Link } from "../../../../i18n/navigation";
import { type Game,getGameEyebrow } from "../../../catalog/shared/model/game";

export function HomeHero({ featuredGame }: { featuredGame?: Game }) {
	const t = useTranslations("home");

	const hero = featuredGame ? {
		badge: t("featuredBadge"),
		eyebrow: getGameEyebrow(featuredGame),
		title: featuredGame.title,
		copy: featuredGame.summary ?? t("featuredFallback"),
		primaryHref: `/game/${featuredGame.slug}`,
		primaryLabel: t("exploreGame"),
		secondaryHref: "#featured",
		secondaryLabel: t("browseHighlights"),
		index: "01",
		caption: t("featuredCaption"),
	} : {
		badge: t("defaultBadge"),
		eyebrow: t("defaultEyebrow"),
		title: "ScholArk",
		copy: t("defaultCopy"),
		primaryHref: "/catalog",
		primaryLabel: t("browseCatalog"),
		secondaryHref: "#subjects",
		secondaryLabel: t("exploreSubjects"),
		index: "SK",
		caption: t("defaultCaption"),
	};

	return (
		<section className={styles.hero}>
			{featuredGame?.cover ? <Image className={styles.heroImage} src={featuredGame.cover.src} alt="" fill priority sizes="100vw"/> : null}
			<div className={styles.heroWash}/>
			<div className={styles.heroContent}>
				<Badge className={styles.heroBadge}>
					<GraduationCap data-icon="inline-start"/> {hero.badge}
				</Badge>
				<p className={styles.heroEyebrow}>{hero.eyebrow}</p>
				<h1>{hero.title}</h1>
				<p className={styles.heroCopy}>{hero.copy}</p>
				<div className={styles.heroActions}>
					<Link className={buttonVariants({ size: "lg" })} href={hero.primaryHref}>
						{hero.primaryLabel} <ArrowRight data-icon="inline-end"/>
					</Link>
					<a className={buttonVariants({ size: "lg" })} href={hero.secondaryHref}>
						<Play data-icon="inline-start"/> {hero.secondaryLabel}
					</a>
				</div>
			</div>
			<div className={styles.heroIndex} aria-hidden="true">
				<span>{hero.index}</span><span>{hero.caption}</span>
			</div>
		</section>
	);
}
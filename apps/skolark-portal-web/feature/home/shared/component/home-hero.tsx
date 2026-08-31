import { Badge } from "@repo/ui/badge";
import { buttonVariants } from "@repo/ui/button";
import {
	ArrowRight,
	GraduationCap,
	Play
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import styles from "../../../../asset/style/site.module.css";
import { type Game,getGameEyebrow } from "../../../catalog/shared/model/game";

export function HomeHero({ featuredGame }: { featuredGame?: Game }) {
	const hero = featuredGame ? {
		badge: "Featured learning experience",
		eyebrow: getGameEyebrow(featuredGame),
		title: featuredGame.title,
		copy: featuredGame.summary ?? "Discover a learning experience built around meaningful decisions and lasting consequences.",
		primaryHref: `/game/${featuredGame.slug}`,
		primaryLabel: "Explore the game",
		secondaryHref: "#featured",
		secondaryLabel: "Browse highlights",
		index: "01",
		caption: "Curated for the curious",
	} : {
		badge: "Games for serious learning",
		eyebrow: "Learn through play",
		title: "SkolArk",
		copy: "Discover educational games built around meaningful decisions, lasting consequences, and ideas worth exploring.",
		primaryHref: "/catalog",
		primaryLabel: "Browse the catalog",
		secondaryHref: "#subjects",
		secondaryLabel: "Explore subjects",
		index: "SK",
		caption: "Built for curious minds",
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
					<a className={buttonVariants({ variant: "outline", size: "lg" })} href={hero.secondaryHref}>
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
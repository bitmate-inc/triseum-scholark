import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import styles from "../../asset/style/site.module.css";
import { getFeaturedGameListRequest } from "../../feature/catalog/server/request/get-featured-game-list.request";
import { GameCard } from "../../feature/catalog/shared/component/game-card";
import { HomeHero } from "../../feature/home/shared/component/home-hero";
import { Link } from "../../i18n/navigation";

export default async function Home() {
	const t = await getTranslations("home");
	const { gameList: featuredGameList } = await getFeaturedGameListRequest();
	const [heroGame, ...gridGameList] = featuredGameList;

	return (
		<main>
			<HomeHero featuredGame={heroGame}/>

			{heroGame ? <section className={styles.featuredSection} id="featured">
				<div className={styles.sectionHeading}>
					<div>
						<p className={styles.kicker}>{t("editorsSelection")}</p>
						<h2>{t("featuredHeading")}</h2>
					</div>
					<Link className={styles.textLink} href="/catalog">
						{t("viewFullCatalog")} <ArrowRight aria-hidden="true"/>
					</Link>
				</div>
				<div className={styles.gameGrid}>
					{gridGameList.map((game) => <GameCard game={game} key={game.slug}/>) }
				</div>
			</section> : null}

			<section className={styles.subjectBand} id="subjects">
				<p className={styles.kicker}>{t("syllabusKicker")}</p>
				<div className={styles.subjectStatement}>
					<h2>{t("subjectHeading")}</h2>
					<p>{t("subjectDescription")}</p>
				</div>
			</section>
		</main>
	);
}

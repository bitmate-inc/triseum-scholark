import { ArrowRight } from "lucide-react";
import Link from "next/link";

import styles from "../asset/style/site.module.css";
import { getFeaturedGameListRequest } from "../feature/catalog/server/request/get-featured-game-list.request";
import { GameCard } from "../feature/catalog/shared/component/game-card";
import { HomeHero } from "../feature/home/shared/component/home-hero";

export default async function Home() {
	const { gameList: featuredGameList } = await getFeaturedGameListRequest();
	const [heroGame, ...gridGameList] = featuredGameList;

	return (
		<main>
			<HomeHero featuredGame={heroGame}/>

			{heroGame ? <section className={styles.featuredSection} id="featured">
				<div className={styles.sectionHeading}>
					<div>
						<p className={styles.kicker}>Editor’s selection</p>
						<h2>Learning worth getting lost in</h2>
					</div>
					<Link className={styles.textLink} href="/catalog">
						View the full catalog <ArrowRight aria-hidden="true"/>
					</Link>
				</div>
				<div className={styles.gameGrid}>
					{gridGameList.map((game) => <GameCard game={game} key={game.slug}/>) }
				</div>
			</section> : null}

			<section className={styles.subjectBand} id="subjects">
				<p className={styles.kicker}>Made for the syllabus</p>
				<div className={styles.subjectStatement}>
					<h2>Serious subjects. Playful systems.</h2>
					<p>Discover learning experiences built around decisions, consequences, and the kind of questions that stay with you after class.</p>
				</div>
			</section>
		</main>
	);
}

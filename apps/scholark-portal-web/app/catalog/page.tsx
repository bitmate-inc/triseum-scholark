import type { Metadata } from "next";

import styles from "../../asset/style/site.module.css";
import { CatalogSearch } from "../../feature/catalog/client/component/catalog-search";
import { getGameListRequest } from "../../feature/catalog/server/request/get-game-list.request";

export const metadata: Metadata = {
	title: "Game catalog · ScholArk",
	description: "Search educational games by title, subject, and play style.",
};

export default async function CatalogPage() {
	const initialGameListResponse = await getGameListRequest({ limit: 3, offset: 0 });

	return (
		<main className={styles.catalogPage}>
			<header className={styles.catalogIntro}>
				<p className={styles.kicker}>The game catalog</p>
				<h1>Find your next learning obsession.</h1>
				<p>Search simulations, mysteries, and strategy games designed for higher education and ambitious independent learners.</p>
			</header>
			<CatalogSearch initialGameListResponse={initialGameListResponse}/>
		</main>
	);
}
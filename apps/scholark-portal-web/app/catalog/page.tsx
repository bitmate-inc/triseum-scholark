import type { Metadata } from "next";
import { redirect } from "next/navigation";

import styles from "../../asset/style/site.module.css";
import { CatalogSearch } from "../../feature/catalog/client/component/catalog-search";
import { getGameListRequest } from "../../feature/catalog/server/request/get-game-list.request";
import { CATALOG_PAGE_SIZE } from "../../feature/catalog/shared/model/catalog";

export const metadata: Metadata = {
	title: "Game catalog · ScholArk",
	description: "Search educational games by title, subject, and play style.",
};

type CatalogSearchParams = Promise<{ page?: string | string[]; q?: string | string[] }>;

function getFirstValue(value: string | string[] | undefined): string | undefined {
	return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | undefined): number {
	const page = Number(value);
	return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export default async function CatalogPage({ searchParams }: { searchParams: CatalogSearchParams }) {
	const params = await searchParams;
	const requestedPage = parsePage(getFirstValue(params.page));
	const query = getFirstValue(params.q)?.trim() ?? "";
	const requestedResponse = await getGameListRequest({
		limit: CATALOG_PAGE_SIZE,
		offset: (requestedPage - 1) * CATALOG_PAGE_SIZE,
		q: query || undefined,
	});
	const pageCount = Math.max(1, Math.ceil(requestedResponse.totalItemCount / CATALOG_PAGE_SIZE));
	const page = Math.min(requestedPage, pageCount);
	if (page !== requestedPage) {
		const canonicalSearchParams = new URLSearchParams();
		if (query) {
			canonicalSearchParams.set("q", query);
		}
		if (page > 1) {
			canonicalSearchParams.set("page", String(page));
		}
		const queryString = canonicalSearchParams.toString();
		redirect(`/catalog${queryString ? `?${queryString}` : ""}`);
	}
	const initialGameListResponse = requestedResponse;

	return (
		<main className={styles.catalogPage}>
			<header className={styles.catalogIntro}>
				<p className={styles.kicker}>The game catalog</p>
				<h1>Find your next learning obsession.</h1>
				<p>Search simulations, mysteries, and strategy games designed for higher education and ambitious independent learners.</p>
			</header>
			<CatalogSearch
				initialGameListResponse={initialGameListResponse}
				initialPage={page}
				initialQuery={query}
			/>
		</main>
	);
}
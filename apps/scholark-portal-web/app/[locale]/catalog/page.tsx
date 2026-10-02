import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import styles from "../../../asset/style/site.module.css";
import { CatalogSearch } from "../../../feature/catalog/client/component/catalog-search";
import { getGameListRequest } from "../../../feature/catalog/server/request/get-game-list.request";
import { CATALOG_PAGE_SIZE } from "../../../feature/catalog/shared/model/catalog";
import { getPathname } from "../../../i18n/navigation";
import { isLocale } from "../../../i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale } = await params;
	if (!isLocale(locale)) notFound();
	const t = await getTranslations({ locale, namespace: "metadata" });
	return { title: t("catalogTitle"), description: t("catalogDescription") };
}

type CatalogSearchParams = Promise<{ page?: string | string[]; q?: string | string[] }>;

function getFirstValue(value: string | string[] | undefined): string | undefined {
	return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | undefined): number {
	const page = Number(value);
	return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export default async function CatalogPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: CatalogSearchParams }) {
	const [{ locale: requestedLocale }, search] = await Promise.all([params, searchParams]);
	if (!isLocale(requestedLocale)) notFound();
	const locale = requestedLocale;
	const t = await getTranslations("catalogPage");
	const requestedPage = parsePage(getFirstValue(search.page));
	const query = getFirstValue(search.q)?.trim() ?? "";
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
		redirect(getPathname({ locale, href: `/catalog${queryString ? `?${queryString}` : ""}` }));
	}
	const initialGameListResponse = requestedResponse;

	return (
		<main className={styles.catalogPage}>
			<header className={styles.catalogIntro}>
				<p className={styles.kicker}>{t("kicker")}</p>
				<h1>{t("heading")}</h1>
				<p>{t("description")}</p>
			</header>
			<CatalogSearch
				initialGameListResponse={initialGameListResponse}
				initialPage={page}
				initialQuery={query}
			/>
		</main>
	);
}
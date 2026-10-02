"use client";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@repo/ui/pagination";
import {
	Search,
	SlidersHorizontal,
	X
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import styles from "../../../../asset/style/site.module.css";
import { useRouter } from "../../../../i18n/navigation";
import { useGameGetGameListQuery } from "../../../api/client/api/generated-api";
import { GameCard } from "../../shared/component/game-card";
import { CATALOG_PAGE_SIZE } from "../../shared/model/catalog";
import type { GetGameListResponse } from "../../shared/model/game";
import { useDebouncedValue } from "../hook/use-debounced-value";

const filterKeyList = ["subject", "skillLevel", "playMode"] as const;
const SEARCH_DEBOUNCE_MS = 300;

type CatalogSearchProps = {
	initialGameListResponse: GetGameListResponse;
	initialPage: number;
	initialQuery: string;
};

type PaginationItemValue = number | "ellipsis-start" | "ellipsis-end";

function getPaginationItemList(
	currentPage: number,
	totalPageCount: number,
): PaginationItemValue[] {
	if (totalPageCount <= 5) {
		return Array.from({ length: totalPageCount }, (_, index) => index + 1);
	}

	const pageNumberList = [...new Set([
		1,
		currentPage - 1,
		currentPage,
		currentPage + 1,
		totalPageCount,
	])]
		.filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPageCount)
		.sort((left, right) => left - right);

	return pageNumberList.flatMap((pageNumber, index) => {
		const previousPageNumber = pageNumberList[index - 1];
		if (previousPageNumber !== undefined && pageNumber - previousPageNumber > 1) {
			return [index === 1 ? "ellipsis-start" : "ellipsis-end", pageNumber];
		}

		return pageNumber;
	});
}

export function CatalogSearch({ initialGameListResponse, initialPage, initialQuery }: CatalogSearchProps) {
	const t = useTranslations("catalog");
	const router = useRouter();
	const searchParams = useSearchParams();
	const searchParamString = searchParams.toString();
	const searchParamQuery = searchParams.get("q")?.trim() ?? "";
	const pageParam = searchParams.get("page");
	const parsedPage = Number(pageParam);
	const requestedPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
	const initialPageCount = Math.max(1, Math.ceil(initialGameListResponse.totalItemCount / CATALOG_PAGE_SIZE));
	const page = searchParamQuery === initialQuery ? Math.min(requestedPage, initialPageCount) : requestedPage;
	const [query, setQuery] = useState(searchParamQuery);
	const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
	const normalizedQuery = debouncedQuery.trim();
	const isDebouncing = query.trim() !== normalizedQuery;
	const isInitialRequest = page === initialPage && searchParamQuery === initialQuery;

	useEffect(() => {
		setQuery(searchParamQuery);
	}, [searchParamQuery]);

	useEffect(() => {
		if (requestedPage <= page || pageParam === null && requestedPage === 1) {
			return;
		}

		const nextSearchParams = new URLSearchParams(searchParamString);
		if (page > 1) {
			nextSearchParams.set("page", String(page));
		} else {
			nextSearchParams.delete("page");
		}
		const nextSearchParamString = nextSearchParams.toString();
		router.replace(`/catalog${nextSearchParamString ? `?${nextSearchParamString}` : ""}`, { scroll: false });
	}, [page, pageParam, requestedPage, router, searchParamString]);

	useEffect(() => {
		if (isDebouncing) {
			return;
		}

		const nextPage = normalizedQuery === searchParamQuery ? page : 1;
		const nextSearchParams = new URLSearchParams();
		if (normalizedQuery) {
			nextSearchParams.set("q", normalizedQuery);
		}
		if (nextPage > 1) {
			nextSearchParams.set("page", String(nextPage));
		}

		const nextSearchParamString = nextSearchParams.toString();
		if (nextSearchParamString !== searchParamString) {
			router.replace(`/catalog${nextSearchParamString ? `?${nextSearchParamString}` : ""}`, { scroll: false });
		}
	}, [isDebouncing, normalizedQuery, page, router, searchParamQuery, searchParamString]);

	const { data, error, isFetching, refetch } = useGameGetGameListQuery(
		{
			limit: CATALOG_PAGE_SIZE,
			offset: (page - 1) * CATALOG_PAGE_SIZE,
			q: searchParamQuery || undefined,
		},
		{ skip: isInitialRequest },
	);
	const result = isInitialRequest ? initialGameListResponse : data ?? initialGameListResponse;
	const gameList = result?.gameList ?? [];
	const totalItemCount = result?.totalItemCount ?? 0;
	const totalPageCount = Math.max(1, Math.ceil(totalItemCount / CATALOG_PAGE_SIZE));
	const paginationItemList = getPaginationItemList(page, totalPageCount);
	const isPending = isFetching || isDebouncing || searchParamQuery !== normalizedQuery;

	function updateQuery(nextQuery: string) {
		setQuery(nextQuery);
	}

	function updatePage(nextPage: number) {
		const nextSearchParams = new URLSearchParams(searchParamString);
		if (nextPage > 1) {
			nextSearchParams.set("page", String(nextPage));
		} else {
			nextSearchParams.delete("page");
		}
		const nextSearchParamString = nextSearchParams.toString();
		router.push(`/catalog${nextSearchParamString ? `?${nextSearchParamString}` : ""}`, { scroll: false });
	}

	const catalogReturnUrl = `/catalog${searchParamString ? `?${searchParamString}` : ""}`;

	return (
		<>
			<div className={styles.searchBar}>
				<Search aria-hidden="true"/>
				<label className={styles.srOnly} htmlFor="game-search">
					{t("searchGamesByTitle")}
				</label>
				<Input
					id="game-search"
					type="search"
					value={query}
					onChange={(event) => updateQuery(event.target.value)}
					placeholder={t("searchByGameTitle")}
					autoComplete="off"
				/>
				{query ? (
					<Button
						variant="ghost"
						size="icon"
						type="button"
						onClick={() => updateQuery("")}
						aria-label={t("clearSearch")}
					>
						<X/>
					</Button>
				) : null}
			</div>
			<div className={styles.filterRow} aria-label={t("filtersLabel")}>
				<SlidersHorizontal aria-hidden="true"/>
				{filterKeyList.map((key) => (
					<Button key={key} variant="outline" size="sm" type="button" disabled>
						{t(key)}
						<Badge variant="secondary">{t("soon")}</Badge>
					</Button>
				))}
			</div>
			<div className={styles.resultsHeader}>
				<p aria-live="polite">
					{t("gameCount", { count: totalItemCount })}
				</p>
				<span>{isPending ? t("updatingResults") : normalizedQuery ? t("matchingQuery", { query: normalizedQuery }) : t("pageStatus", { page, total: totalPageCount })}</span>
			</div>
			{error ? (
				<div className={styles.emptyState} role="alert">
					<h2>{t("couldNotLoadGames")}</h2>
					<p>{t("catalogRequestFailed")}</p>
					<Button variant="outline" type="button" onClick={() => void refetch()}>
						{t("retry")}
					</Button>
				</div>
			) : gameList.length ? (
				<>
					<div className={styles.gameGrid}>
						{gameList.map((game) => (
							<GameCard
								game={game}
								href={`/game/${game.slug}?returnTo=${encodeURIComponent(catalogReturnUrl)}`}
								key={game.slug}
							/>
						))}
					</div>
					{totalPageCount > 1 ? (
						<Pagination className={styles.catalogPagination}>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										type="button"
										aria-label={t("previousPage")}
										disabled={page === 1 || isFetching}
										onClick={() => updatePage(page - 1)}
									/>
								</PaginationItem>
								{paginationItemList.map((item) => item === "ellipsis-start" || item === "ellipsis-end" ? (
									<PaginationItem key={item}>
										<PaginationEllipsis/>
									</PaginationItem>
								) : (
									<PaginationItem key={item}>
										<PaginationLink
											type="button"
											isActive={item === page}
											disabled={isFetching}
											onClick={() => updatePage(item)}
										>
											{item}
										</PaginationLink>
									</PaginationItem>
								))}
								<PaginationItem>
									<PaginationNext
										type="button"
										aria-label={t("nextPage")}
										disabled={page === totalPageCount || isFetching}
										onClick={() => updatePage(page + 1)}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					) : null}
				</>
			) : (
				<div className={styles.emptyState}>
					<Search aria-hidden="true"/>
					<h2>{t("noGamesFound")}</h2>
					<p>{t("differentTitleOrClear")}</p>
					<Button variant="outline" type="button" onClick={() => updateQuery("")}>
						{t("clearSearch")}
					</Button>
				</div>
			)}
		</>
	);
}
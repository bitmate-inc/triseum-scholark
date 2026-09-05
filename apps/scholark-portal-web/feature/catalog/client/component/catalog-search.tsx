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
import { useState } from "react";

import styles from "../../../../asset/style/site.module.css";
import { useGameGetGameListQuery } from "../../../api/client/api/generated-api";
import { GameCard } from "../../shared/component/game-card";
import type { GetGameListResponse } from "../../shared/model/game";
import { useDebouncedValue } from "../hook/use-debounced-value";

const filterLabelList = ["Subject", "Skill level", "Play mode"];
const PAGE_SIZE = 3;
const SEARCH_DEBOUNCE_MS = 300;

type CatalogSearchProps = {
	initialGameListResponse: GetGameListResponse;
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

export function CatalogSearch({ initialGameListResponse }: CatalogSearchProps) {
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);
	const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
	const normalizedQuery = query.trim() === "" ? "" : debouncedQuery.trim();
	const isInitialRequest = page === 1 && normalizedQuery === "";
	const { data, error, isFetching, refetch } = useGameGetGameListQuery(
		{
			limit: PAGE_SIZE,
			offset: (page - 1) * PAGE_SIZE,
			q: normalizedQuery || undefined,
		},
		{ skip: isInitialRequest },
	);
	const result = isInitialRequest ? initialGameListResponse : data ?? initialGameListResponse;
	const gameList = result?.gameList ?? [];
	const totalItemCount = result?.totalItemCount ?? 0;
	const totalPageCount = Math.max(1, Math.ceil(totalItemCount / PAGE_SIZE));
	const paginationItemList = getPaginationItemList(page, totalPageCount);
	const isPending = isFetching || (query.trim() !== "" && debouncedQuery !== query);

	function updateQuery(nextQuery: string) {
		setQuery(nextQuery);
		setPage(1);
	}

	return (
		<>
			<div className={styles.searchBar}>
				<Search aria-hidden="true"/>
				<label className={styles.srOnly} htmlFor="game-search">
					Search games by title
				</label>
				<Input
					id="game-search"
					type="search"
					value={query}
					onChange={(event) => updateQuery(event.target.value)}
					placeholder="Search by game title..."
					autoComplete="off"
				/>
				{query ? (
					<Button
						variant="ghost"
						size="icon"
						type="button"
						onClick={() => updateQuery("")}
						aria-label="Clear search"
					>
						<X/>
					</Button>
				) : null}
			</div>
			<div className={styles.filterRow} aria-label="Catalog filters">
				<SlidersHorizontal aria-hidden="true"/>
				{filterLabelList.map((label) => (
					<Button key={label} variant="outline" size="sm" type="button" disabled>
						{label}
						<Badge variant="secondary">Soon</Badge>
					</Button>
				))}
			</div>
			<div className={styles.resultsHeader}>
				<p aria-live="polite">
					<strong>{totalItemCount}</strong> {totalItemCount === 1 ? "game" : "games"}
				</p>
				<span>{isPending ? "Updating results…" : normalizedQuery ? `Matching “${normalizedQuery}”` : `Page ${page} of ${totalPageCount}`}</span>
			</div>
			{error ? (
				<div className={styles.emptyState} role="alert">
					<h2>Couldn’t load games</h2>
					<p>The catalog request failed. Try loading this page again.</p>
					<Button variant="outline" type="button" onClick={() => void refetch()}>
						Retry
					</Button>
				</div>
			) : gameList.length ? (
				<>
					<div className={styles.gameGrid}>
						{gameList.map((game) => (
							<GameCard game={game} key={game.slug}/>
						))}
					</div>
					{totalPageCount > 1 ? (
						<Pagination className={styles.catalogPagination}>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										type="button"
										disabled={page === 1 || isFetching}
										onClick={() => setPage((currentPage) => currentPage - 1)}
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
											onClick={() => setPage(item)}
										>
											{item}
										</PaginationLink>
									</PaginationItem>
								))}
								<PaginationItem>
									<PaginationNext
										type="button"
										disabled={page === totalPageCount || isFetching}
										onClick={() => setPage((currentPage) => currentPage + 1)}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					) : null}
				</>
			) : (
				<div className={styles.emptyState}>
					<Search aria-hidden="true"/>
					<h2>No games found</h2>
					<p>Try a different title or clear the search.</p>
					<Button variant="outline" type="button" onClick={() => updateQuery("")}>
						Clear search
					</Button>
				</div>
			)}
		</>
	);
}
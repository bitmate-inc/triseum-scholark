"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import styles from "../../../../asset/style/site.module.css";
import { API_BASE_URL } from "../../../api/shared/config/api.config";
import { AcademicCard } from "../../shared/component/academic-card";
import type { AcademicItem, AcademicResource } from "../../shared/model/education";
import { useDebouncedValue } from "../hook/use-debounced-value";

const SEARCH_DEBOUNCE_MS = 300;

type AcademicSearchProps = {
	resource: AcademicResource;
	initialItemList: AcademicItem[];
	initialTotalItemCount: number;
	filters?: Record<string, string>;
	label: string;
};

function getResponseList(response: Record<string, unknown>, resource: AcademicResource): AcademicItem[] {
	return (response[`${resource}List`] as AcademicItem[] | undefined) ?? [];
}

export function AcademicSearch({
	resource,
	initialItemList,
	initialTotalItemCount,
	filters = {},
	label,
}: AcademicSearchProps) {
	const [query, setQuery] = useState("");
	const [itemList, setItemList] = useState(initialItemList);
	const [totalItemCount, setTotalItemCount] = useState(initialTotalItemCount);
	const [error, setError] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS).trim();
	const filterQueryString = new URLSearchParams(filters).toString();

	useEffect(() => {
		if (!debouncedQuery) {
			setItemList(initialItemList);
			setTotalItemCount(initialTotalItemCount);
			setError(false);
			return;
		}

		const controller = new AbortController();
		const searchParams = new URLSearchParams(filterQueryString);
		searchParams.set("q", debouncedQuery);
		setIsFetching(true);
		setError(false);

		void fetch(`${API_BASE_URL}/api/v1/catalog/${resource}?${searchParams}`, {
			credentials: "include",
			signal: controller.signal,
		})
			.then(async (response) => {
				if (!response.ok) throw new Error(`Request failed with ${response.status}`);
				return response.json() as Promise<Record<string, unknown>>;
			})
			.then((response) => {
				setItemList(getResponseList(response, resource));
				setTotalItemCount(Number(response.totalItemCount ?? 0));
			})
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === "AbortError") return;
				setError(true);
			})
			.finally(() => setIsFetching(false));

		return () => controller.abort();
	}, [debouncedQuery, filterQueryString, initialItemList, initialTotalItemCount, resource]);

	return (
		<div className={styles.academicSearch}>
			<div className={styles.searchBar}>
				<Search aria-hidden="true"/>
				<label className={styles.srOnly} htmlFor={`${resource}-search`}>Search {label.toLowerCase()}</label>
				<Input
					id={`${resource}-search`}
					type="search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder={`Search ${label.toLowerCase()}...`}
					autoComplete="off"
				/>
				{query ? (
					<Button variant="ghost" size="icon" type="button" onClick={() => setQuery("")} aria-label="Clear search">
						<X/>
					</Button>
				) : null}
			</div>
			<div className={styles.resultsHeader}>
				<p aria-live="polite"><strong>{totalItemCount}</strong> {label.toLowerCase()}</p>
				<span>{isFetching ? "Updating results…" : debouncedQuery ? `Matching “${debouncedQuery}”` : "All available"}</span>
			</div>
			{error ? (
				<div className={styles.emptyState} role="alert"><h3>Couldn’t load {label.toLowerCase()}</h3><p>Try your search again.</p></div>
			) : itemList.length ? (
				<div className={styles.gameGrid}>
					{itemList.map((item) => <AcademicCard item={item} resource={resource} key={item.id}/>)}
				</div>
			) : (
				<div className={styles.emptyState}><Search aria-hidden="true"/><h3>No {label.toLowerCase()} found</h3><p>Try another search.</p></div>
			)}
		</div>
	);
}
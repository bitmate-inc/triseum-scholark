import "server-only";

import { apiFetch } from "../../../api/server/request/api-fetch";
import type { GetGameListQuery, GetGameListResponse } from "../../shared/model/game";

export async function getGameListRequest(
	query: GetGameListQuery = {},
): Promise<GetGameListResponse> {
	const searchParams = new URLSearchParams();

	if (query.q !== undefined) searchParams.set("q", query.q);
	if (query.limit !== undefined) searchParams.set("limit", String(query.limit));
	if (query.offset !== undefined) searchParams.set("offset", String(query.offset));

	const queryString = searchParams.toString();
	return apiFetch<GetGameListResponse>(
		`/api/v1/catalog/game${queryString ? `?${queryString}` : ""}`,
	);
}
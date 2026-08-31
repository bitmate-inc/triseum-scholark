import "server-only";

import { apiFetch } from "../../../api/server/request/api-fetch";
import type { GetGameListResponse } from "../../shared/model/game";

export async function getFeaturedGameListRequest(): Promise<GetGameListResponse> {
	return apiFetch<GetGameListResponse>("/api/v1/catalog/game/featured");
}
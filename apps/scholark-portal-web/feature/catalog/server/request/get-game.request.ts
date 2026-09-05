import "server-only";

import { apiFetch,ApiRequestError } from "../../../api/server/request/api-fetch";
import type { Game, GetGameResponse } from "../../shared/model/game";

export async function getGameRequest(slug: string): Promise<Game | undefined> {
	try {
		const { game } = await apiFetch<GetGameResponse>(
			`/api/v1/catalog/game/${encodeURIComponent(slug)}`,
		);
		return game;
	} catch (error) {
		if (error instanceof ApiRequestError && error.status === 404) return undefined;
		throw error;
	}
}
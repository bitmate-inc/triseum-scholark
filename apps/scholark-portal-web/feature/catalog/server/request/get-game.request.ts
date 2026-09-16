import "server-only";

import { apiFetch,ApiRequestError } from "../../../api/server/request/api-fetch";
import type { GameDetails, GetGameResponse } from "../../shared/model/game";

export async function getGameRequest(slug: string): Promise<GameDetails | undefined> {
	try {
		const response = await apiFetch<GetGameResponse>(
			`/api/v1/catalog/game/${encodeURIComponent(slug)}`,
		);
		return { ...response.game, gameVersionList: response.gameVersionList ?? [] };
	} catch (error) {
		if (error instanceof ApiRequestError && error.status === 404) return undefined;
		throw error;
	}
}
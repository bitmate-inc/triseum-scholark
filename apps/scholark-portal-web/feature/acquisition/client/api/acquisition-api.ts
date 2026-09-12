import { api } from "../../../api/client/api/api-base";

const acquisitionApi = api.injectEndpoints({
	endpoints: (build) => ({
		acquireGame: build.mutation<void, string>({
			invalidatesTags: ["Library"],
			query: (gameId) => ({
				body: { gameId },
				method: "POST",
				url: "/api/v1/catalog/game/acquisition",
			}),
		}),
	}),
});

export const { useAcquireGameMutation } = acquisitionApi;

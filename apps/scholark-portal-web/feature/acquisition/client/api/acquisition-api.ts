import { api } from "../../../api/client/api/api-base";

const acquisitionApi = api.injectEndpoints({
	endpoints: (build) => ({
		acquireGame: build.mutation<void, string>({
			invalidatesTags: ["Library"],
			query: (gameProductId) => ({
				body: { gameProductId },
				method: "POST",
				url: "/api/v1/catalog/game/acquisition",
			}),
		}),
		acquireClassroomGame: build.mutation<void, string>({
			invalidatesTags: ["Library"],
			query: (classroomGameId) => ({
				method: "POST",
				url: `/api/v1/catalog/classroom-game/${classroomGameId}/acquisition`,
			}),
		}),
	}),
});

export const { useAcquireClassroomGameMutation, useAcquireGameMutation } = acquisitionApi;

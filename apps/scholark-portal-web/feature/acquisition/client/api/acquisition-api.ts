import { api } from "../../../api/client/api/api-base";

const acquisitionApi = api.injectEndpoints({
	endpoints: (build) => ({
		acquireGame: build.mutation<{ checkoutUrl: string; checkoutSessionId: string }, string>({
			query: (publicOfferId) => ({
				body: { publicOfferId },
				method: "POST",
				url: "/api/v1/catalog/game/acquisition",
			}),
		}),
		acquireClassroomGame: build.mutation<{ checkoutUrl: string; checkoutSessionId: string }, string>({
			query: (classroomGameId) => ({
				method: "POST",
				url: `/api/v1/catalog/classroom-game/${classroomGameId}/acquisition`,
			}),
		}),
		getCheckoutStatus: build.query<{ status: "pending" | "fulfilled" | "failed" }, string>({
			query: (checkoutSessionId) => ({
				url: `/api/v1/user/me/checkout-status?checkoutSessionId=${encodeURIComponent(checkoutSessionId)}`,
			}),
		}),
		redeemAcquisitionCode: build.mutation<{ licenseId: string; licenseDurationDays: number }, { classroomGameId: string; code: string }>({
			invalidatesTags: ["Library"],
			query: ({ classroomGameId, code }) => ({
				body: { code },
				method: "POST",
				url: `/api/v1/catalog/classroom-game/${classroomGameId}/redeem-code`,
			}),
		}),
	}),
});

export const { useAcquireClassroomGameMutation, useAcquireGameMutation, useGetCheckoutStatusQuery, useRedeemAcquisitionCodeMutation } = acquisitionApi;

import { api } from "../../../api/client/api/api-base";

const acquisitionApi = api.injectEndpoints({
	endpoints: (build) => ({
		acquireGame: build.mutation<{ checkoutUrl: string; checkoutSessionId: string }, string>({
			query: (publicListingId) => ({
				body: { publicListingId },
				method: "POST",
				url: "/api/v1/catalog/game/acquisition",
			}),
		}),
		acquireClassroomGameListing: build.mutation<{ checkoutUrl: string; checkoutSessionId: string }, string>({
			query: (classroomGameListingId) => ({
				method: "POST",
				url: `/api/v1/catalog/classroom-game-listing/${classroomGameListingId}/acquisition`,
			}),
		}),
		getCheckoutStatus: build.query<{ status: "pending" | "fulfilled" | "failed" }, string>({
			query: (checkoutSessionId) => ({
				url: `/api/v1/user/me/checkout-status?checkoutSessionId=${encodeURIComponent(checkoutSessionId)}`,
			}),
		}),
		redeemAcquisitionCode: build.mutation<{ licenseId: string; licenseDurationDays: number }, { classroomGameListingId: string; code: string }>({
			invalidatesTags: ["Library"],
			query: ({ classroomGameListingId, code }) => ({
				body: { code },
				method: "POST",
				url: `/api/v1/catalog/classroom-game-listing/${classroomGameListingId}/redeem-code`,
			}),
		}),
	}),
});

export const { useAcquireClassroomGameListingMutation, useAcquireGameMutation, useGetCheckoutStatusQuery, useRedeemAcquisitionCodeMutation } = acquisitionApi;

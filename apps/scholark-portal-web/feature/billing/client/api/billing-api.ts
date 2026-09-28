import { api } from "../../../api/client/api/api-base";

export type PaymentAttemptStatus = "pending" | "fulfilled" | "failed";

export interface PaymentAttempt {
	canRevalidate: boolean;
	createdAt: string;
	fulfilledAt?: string;
	gameTitle: string;
	id: string;
	price: { currency: string; minorUnitAmount: number };
	status: PaymentAttemptStatus;
}

interface PaymentAttemptListResponse {
	itemList: PaymentAttempt[];
}

const billingApi = api.injectEndpoints({
	endpoints: (build) => ({
		getPaymentAttempts: build.query<PaymentAttemptListResponse, void>({
			providesTags: ["PaymentAttempts"],
			query: () => ({ url: "/api/v1/user/me/payment-attempts" }),
		}),
		revalidatePaymentAttempt: build.mutation<{ status: PaymentAttemptStatus }, string>({
			invalidatesTags: ["PaymentAttempts"],
			query: (attemptId) => ({
				method: "POST",
				url: `/api/v1/user/me/payment-attempts/${encodeURIComponent(attemptId)}/revalidate`,
			}),
		}),
	}),
});

export const { useGetPaymentAttemptsQuery, useRevalidatePaymentAttemptMutation } = billingApi;
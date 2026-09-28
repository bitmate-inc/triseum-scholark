import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { API_BASE_URL } from "../../shared/config/api.config";

export const api = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: API_BASE_URL,
		credentials: "include",
	}),
	tagTypes: ["Library", "PaymentAttempts"],
	endpoints: () => ({}),
	reducerPath: "api",
});

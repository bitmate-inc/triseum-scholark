import "server-only";

import { API_BASE_URL } from "../../shared/config/api.config";

export class ApiRequestError extends Error {

	constructor(
		public readonly status: number,
		statusText: string,
	) {
		super(`API request failed with ${status} ${statusText}`);
		this.name = "ApiRequestError";
	}

}

export async function apiFetch<Response>(path: string): Promise<Response> {
	const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${path}`, {
		headers: { Accept: "application/json" },
		next: { revalidate: 300 },
	});

	if (!response.ok) {
		throw new ApiRequestError(response.status, response.statusText);
	}

	return response.json() as Promise<Response>;
}

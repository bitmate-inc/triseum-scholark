import "server-only";

import { API_BASE_URL } from "../../shared/config/api.config";

const API_SERVER_BASE_URL = process.env.API_SERVER_BASE_URL ?? API_BASE_URL;

function getApiServerBaseUrl(): string {
	try {
		return new URL(API_SERVER_BASE_URL).toString().replace(/\/$/, "");
	} catch {
		throw new Error(
			"API_SERVER_BASE_URL must be an absolute URL for server-side requests",
		);
	}
}

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
	const response = await fetch(`${getApiServerBaseUrl()}${path}`, {
		headers: { Accept: "application/json" },
		next: { revalidate: 300 },
	});

	if (!response.ok) {
		throw new ApiRequestError(response.status, response.statusText);
	}

	return response.json() as Promise<Response>;
}

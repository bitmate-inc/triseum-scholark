import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function getApiErrorMessage(error: unknown): string {
	if (!isFetchBaseQueryError(error)) {
		return "Something went wrong. Please try again.";
	}

	if (typeof error.data === "object" && error.data && "message" in error.data) {
		const message = error.data.message;
		return Array.isArray(message) ? message.join(" ") : String(message);
	}

	return "The request could not be completed. Please try again.";
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
	return typeof error === "object" && error !== null && "status" in error;
}
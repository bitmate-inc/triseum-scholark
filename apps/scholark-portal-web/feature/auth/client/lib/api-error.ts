import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function getApiErrorMessage(error: unknown, fallback: { generic: string; request: string }): string {
	if (!isFetchBaseQueryError(error)) {
		return fallback.generic;
	}

	if (typeof error.data === "object" && error.data !== null) {
		const data = error.data as Record<string, unknown>;
		const validationMessage = getValidationMessage(data);
		if (validationMessage) return validationMessage;

		if ("message" in data) {
			return formatMessage(data.message);
		}
	}

	return fallback.request;
}

function getValidationMessage(data: Record<string, unknown>): string | undefined {
	const messageList = typeof data.errorMessage === "string" && data.errorMessage
		? [data.errorMessage]
		: [];

	if (Array.isArray(data.errorList)) {
		messageList.push(...data.errorList.flatMap(getValidationErrorMessages));
	}

	return [...new Set(messageList)].join(" ") || undefined;
}

function getValidationErrorMessages(errorItem: unknown): string[] {
	if (typeof errorItem !== "object" || errorItem === null) return [];

	const error = errorItem as Record<string, unknown>;
	const constraints = error.constraints;
	const messages = typeof constraints === "object" && constraints !== null
		? Object.values(constraints).filter((message): message is string => typeof message === "string")
		: [];
	const children = Array.isArray(error.children)
		? error.children.flatMap(getValidationErrorMessages)
		: [];

	return [...messages, ...children];
}

function formatMessage(message: unknown): string {
	if (Array.isArray(message)) return message.map(String).join(" ");
	return String(message);
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
	return typeof error === "object" && error !== null && "status" in error;
}
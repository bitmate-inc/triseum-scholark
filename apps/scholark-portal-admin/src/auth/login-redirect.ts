interface ReturnLocation {
	hash?: string;
	pathname?: string;
	search?: string;
}

export function getLoginReturnPath(state: unknown): string {
	const from = (state as { from?: ReturnLocation } | null)?.from;
	return `${from?.pathname ?? '/institutions'}${from?.search ?? ''}${from?.hash ?? ''}`;
}
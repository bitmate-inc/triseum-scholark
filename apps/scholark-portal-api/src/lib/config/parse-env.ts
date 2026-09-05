export function parseBoolean(
	value: string | undefined,
	defaultValue = false,
): boolean {
	if (value === undefined) {
		return defaultValue;
	}

	return value === 'true';
}

export function parseNumber(
	value: string | undefined,
	defaultValue: number,
): number {
	if (value === undefined) {
		return defaultValue;
	}

	const parsedValue = Number(value);
	return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
}
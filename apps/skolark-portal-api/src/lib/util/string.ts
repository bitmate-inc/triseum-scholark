export function isString(value: unknown): value is string {
	return typeof value === 'string';
}

export function trimAndNullEmptyString(
	value: string | null | undefined,
): string | undefined | null {
	if (!isString(value)) {
		return value;
	}

	const trimmedValue = value.trim();
	return trimmedValue.length <= 0 ? null : trimmedValue;
}

export function isNull(value: unknown): value is null {
	return value === null;
}

export function isUndefined(value: unknown): value is undefined {
	return typeof value === 'undefined';
}

export function isNullOrUndefined(value: unknown): value is undefined | null {
	return isUndefined(value) || isNull(value);
}

/**
 * Returns a URI with a leading slash and without a trailing slash.
 */
export function normalizeUri(uri: string): string {
	if (uri[0] !== '/') {
		uri = `/${uri}`;
	}

	if (uri[uri.length - 1] === '/') {
		uri = uri.slice(0, -1);
	}

	return uri;
}

export function normalizeBaseUrl(baseUrl: string): string {
	if (baseUrl[baseUrl.length - 1] === '/') {
		baseUrl = baseUrl.slice(0, -1);
	}

	return baseUrl;
}

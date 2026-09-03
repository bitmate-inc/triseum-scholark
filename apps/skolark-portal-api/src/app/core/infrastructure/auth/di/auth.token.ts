function createAuthToken(name: string, mechanism: string = 'default'): string {
	return `AUTH_${name}(${mechanism})`;
}

export function IdentityInputFactory(mechanism: string = 'default'): string {
	return createAuthToken('IDENTITY_INPUT_FACTORY', mechanism);
}

export function IdentityProvider(mechanism: string = 'default'): string {
	return createAuthToken('IDENTITY_PROVIDER', mechanism);
}

export function SessionBuilder(): string {
	return createAuthToken('SESSION_BUILDER');
}

export function SessionSerializer(mechanism: string = 'default'): string {
	return createAuthToken('SESSION_SERIALIZER', mechanism);
}

export function SessionResolver(mechanism: string = 'default'): string {
	return createAuthToken('SESSION_RESOLVER', mechanism);
}

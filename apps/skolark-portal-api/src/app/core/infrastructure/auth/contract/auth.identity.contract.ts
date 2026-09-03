export interface IdentityInputFactory<TSource = unknown, TInput = unknown> {
	create(source: TSource): Promise<TInput> | TInput;
}

export interface IdentityProvider<TInput = unknown, TIdentity = unknown> {
	authenticate(input: TInput): Promise<TIdentity | undefined>;
}

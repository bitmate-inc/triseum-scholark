import type { AccountIdentityProvider } from '../../model/account.identity.entity';

export type ExternalIdentityInput<Provider extends AccountIdentityProvider> = {
	provider: Provider;
	providerAccountId: string;
	providerData?: Record<string, unknown>;
};
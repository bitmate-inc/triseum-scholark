import {
	Inject,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

import type { ExternalIdentityInput } from '../../../feature/account/auth/identity/external.identity-input.model';
import { AccountIdentityProvider } from '../../../feature/account/model/account.identity.entity';
import { AuthModuleConfig } from '../auth.module.config';
import type { IdentityInputFactory as IdentityInputFactoryContract, IdentityProvider as IdentityProviderContract } from '../contract/auth.identity.contract';
import type { SessionBuilder as SessionBuilderContract } from '../contract/auth.session.contract';
import {
	IdentityInputFactory,
	IdentityProvider,
	SessionBuilder
} from '../di/auth.token';
import type { AuthSessionData } from '../model/auth.session.model';

const DISABLED_OAUTH_URL = 'https://example.invalid/oauth';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

	constructor(
		authConfig: AuthModuleConfig,
		@Inject(IdentityInputFactory('google'))
		private readonly identityInputFactory: IdentityInputFactoryContract<ExternalIdentityInput<AccountIdentityProvider.GOOGLE>, ExternalIdentityInput<AccountIdentityProvider.GOOGLE>>,
		@Inject(IdentityProvider('google'))
		private readonly identityProvider: IdentityProviderContract<ExternalIdentityInput<AccountIdentityProvider.GOOGLE>, unknown>,
		@Inject(SessionBuilder())
		private readonly sessionBuilder: SessionBuilderContract<unknown, AuthSessionData>,
	) {
		super({
			callbackURL: authConfig.google?.callbackUrl || `${DISABLED_OAUTH_URL}/google/callback`,
			clientID: authConfig.google?.clientId || 'disabled-google-client-id',
			clientSecret: authConfig.google?.clientSecret || 'disabled-google-client-secret',
			scope: authConfig.google?.scope || ['email', 'profile'],
			state: false,
		});
	}

	async validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<AuthSessionData> {
		const input = await this.identityInputFactory.create({
			provider: AccountIdentityProvider.GOOGLE,
			providerAccountId: profile.id,
			providerData: {
				displayName: profile.displayName,
				email: profile.emails?.[0]?.value,
				emailVerified: profile.emails?.[0]?.verified,
				name: profile.name,
				photos: profile.photos,
				profileUrl: profile.profileUrl,
			},
		});
		const identity = await this.identityProvider.authenticate(input);
		if (!identity) {
			throw new UnauthorizedException();
		}
		return this.sessionBuilder.build(identity);
	}

}
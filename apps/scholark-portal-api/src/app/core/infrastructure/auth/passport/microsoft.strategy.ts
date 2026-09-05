import {
	Inject,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import OAuth2Strategy from 'passport-oauth2';

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

const MICROSOFT_GRAPH_USERINFO_URL = 'https://graph.microsoft.com/oidc/userinfo';

type MicrosoftProfile = {
	id: string;
	displayName?: string;
	email?: string;
	emailVerified?: boolean;
	givenName?: string;
	familyName?: string;
	raw: Record<string, unknown>;
};

class MicrosoftOAuth2Strategy extends OAuth2Strategy {

	private readonly userInfoUrl: string;

	constructor(options: OAuth2Strategy.StrategyOptions & { userInfoURL: string }, verify: OAuth2Strategy.VerifyFunction<MicrosoftProfile>) {
		super(options, verify);
		this.userInfoUrl = options.userInfoURL;
	}

	userProfile(accessToken: string, done: (error?: Error | null, profile?: MicrosoftProfile) => void): void {
		this._oauth2.get(this.userInfoUrl, accessToken, (error, body) => {
			if (error) {
				return done(new OAuth2Strategy.InternalOAuthError('Failed to fetch Microsoft user profile', error));
			}
			try {
				const json = JSON.parse(body as string) as Record<string, unknown>;
				const email = typeof json.email === 'string' ? json.email : typeof json.preferred_username === 'string' ? json.preferred_username : undefined;
				return done(undefined, {
					displayName: typeof json.name === 'string' ? json.name : undefined,
					email,
					emailVerified: typeof json.email_verified === 'boolean' ? json.email_verified : undefined,
					familyName: typeof json.family_name === 'string' ? json.family_name : undefined,
					givenName: typeof json.given_name === 'string' ? json.given_name : undefined,
					id: String(json.sub),
					raw: json,
				});
			} catch {
				return done(new Error('Failed to parse Microsoft user profile'));
			}
		});
	}

}

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(MicrosoftOAuth2Strategy, 'microsoft') {

	constructor(
		authConfig: AuthModuleConfig,
		@Inject(IdentityInputFactory('microsoft'))
		private readonly identityInputFactory: IdentityInputFactoryContract<ExternalIdentityInput<AccountIdentityProvider.MICROSOFT>, ExternalIdentityInput<AccountIdentityProvider.MICROSOFT>>,
		@Inject(IdentityProvider('microsoft'))
		private readonly identityProvider: IdentityProviderContract<ExternalIdentityInput<AccountIdentityProvider.MICROSOFT>, unknown>,
		@Inject(SessionBuilder())
		private readonly sessionBuilder: SessionBuilderContract<unknown, AuthSessionData>,
	) {
		const tenantId = authConfig.microsoft?.tenantId || 'common';
		super({
			authorizationURL: authConfig.microsoft?.authorizationUrl || `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
			callbackURL: authConfig.microsoft?.callbackUrl || 'https://example.invalid/oauth/microsoft/callback',
			clientID: authConfig.microsoft?.clientId || 'disabled-microsoft-client-id',
			clientSecret: authConfig.microsoft?.clientSecret || 'disabled-microsoft-client-secret',
			scope: authConfig.microsoft?.scope || ['openid', 'profile', 'email'],
			state: false,
			tokenURL: authConfig.microsoft?.tokenUrl || `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
			userInfoURL: authConfig.microsoft?.userInfoUrl || MICROSOFT_GRAPH_USERINFO_URL,
		});
	}

	async validate(_accessToken: string, _refreshToken: string, profile: MicrosoftProfile): Promise<AuthSessionData> {
		const input = await this.identityInputFactory.create({
			provider: AccountIdentityProvider.MICROSOFT,
			providerAccountId: profile.id,
			providerData: { ...profile.raw, displayName: profile.displayName, email: profile.email, emailVerified: profile.emailVerified, familyName: profile.familyName, givenName: profile.givenName },
		});
		const identity = await this.identityProvider.authenticate(input);
		if (!identity) {
			throw new UnauthorizedException();
		}
		return this.sessionBuilder.build(identity);
	}

}
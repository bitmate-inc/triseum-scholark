import { BCryptPasswordEncoder } from '../../../../../lib/security/encoder/bcrypt.password-encoder';
import type {
	AuthIdentityMechanism,
	AuthIdentityMechanismProviderOptions,
	AuthModuleProviderOptions,
} from '../../../infrastructure/auth/auth.module';
import { GoogleIdentityProvider, MicrosoftIdentityProvider } from './identity/external.identity.provider';
import { GoogleIdentityInputFactory } from './identity/google.identity-input.factory';
import { MicrosoftIdentityInputFactory } from './identity/microsoft.identity-input.factory';
import { UserIdentityProvider } from './identity/user.identity.provider';
import { UserIdentityInputFactory } from './identity/user.identity-input.factory';
import { UserExpressSessionResolver } from './session/user.express-session.resolver';
import { UserExpressSessionSerializer } from './session/user.express-session.serializer';
import { UserJwtSessionResolver } from './session/user.jwt-session.resolver';
import { UserJwtSessionSerializer } from './session/user.jwt-session.serializer';
import { UserSessionBuilder } from './session/user.session.builder';

const authMechanismOptions: Partial<Record<AuthIdentityMechanism, AuthIdentityMechanismProviderOptions>> = {
	local: {
		authenticator: UserIdentityProvider,
		inputFactory: UserIdentityInputFactory,
	},
	google: {
		authenticator: GoogleIdentityProvider,
		inputFactory: GoogleIdentityInputFactory,
	},
	microsoft: {
		authenticator: MicrosoftIdentityProvider,
		inputFactory: MicrosoftIdentityInputFactory,
	},
};

export function createUserAuthProviderOptions(mechanisms: readonly AuthIdentityMechanism[]): AuthModuleProviderOptions {
	const providerOptions: AuthModuleProviderOptions = {
		expressSession: {
			sessionResolver: UserExpressSessionResolver,
			sessionSerializer: UserExpressSessionSerializer,
		},
		jwt: {
			sessionResolver: UserJwtSessionResolver,
			sessionSerializer: UserJwtSessionSerializer,
		},
		providers: [BCryptPasswordEncoder],
		sessionBuilder: UserSessionBuilder,
	};

	for (const mechanism of mechanisms) {
		const mechanismOptions = authMechanismOptions[mechanism];

		if (!!mechanismOptions) {
			providerOptions[mechanism] = mechanismOptions;
		}
	}

	return providerOptions;
}

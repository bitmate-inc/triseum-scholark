import { BCryptPasswordEncoder } from '../../../../../lib/security/encoder/bcrypt.password-encoder';
import type {
	AuthIdentityMechanism,
	AuthIdentityMechanismProviderOptions,
	AuthModuleProviderOptions,
} from '../../../infrastructure/auth/auth.module';
import { UserIdentityProvider } from './user.identity.provider';
import { UserIdentityInputFactory } from './user.identity-input.factory';
import { UserOpaqueSessionResolver } from './user.opaque-session.resolver';
import { UserOpaqueSessionSerializer } from './user.opaque-session.serializer';
import { UserOpaqueSessionStrategy } from './user.opaque-session.strategy';
import { UserSessionBuilder } from './user.session.builder';

const authMechanismOptions: Record<AuthIdentityMechanism, AuthIdentityMechanismProviderOptions | undefined> = {
	google: undefined,
	local: {
		authenticator: UserIdentityProvider,
		inputFactory: UserIdentityInputFactory,
	},
	microsoft: undefined,
};

export function createUserAuthProviderOptions(mechanisms: readonly AuthIdentityMechanism[]): AuthModuleProviderOptions {
	const providerOptions: AuthModuleProviderOptions = {
		providers: [BCryptPasswordEncoder],
		session: {
			mechanism: 'opaque',
			resolver: UserOpaqueSessionResolver,
			serializer: UserOpaqueSessionSerializer,
			strategies: [UserOpaqueSessionStrategy],
		},
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

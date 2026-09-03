import {
	DynamicModule,
	Global,
	Module,
	Provider,
	Type,
} from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import type { IdentityInputFactory as IdentityInputFactoryContract, IdentityProvider as IdentityProviderContract } from './contract/auth.identity.contract';
import type {
	SessionBuilder as SessionBuilderContract,
	SessionResolver as SessionResolverContract,
	SessionSerializer as SessionSerializerContract,
} from './contract/auth.session.contract';
import {
	IdentityInputFactory,
	IdentityProvider,
	SessionBuilder,
	SessionResolver,
	SessionSerializer,
} from './di/auth.token';
import { AuthSessionData } from './model/auth.session.model';
import { LocalStrategy } from './passport/local.strategy';

export type AuthIdentityMechanism = 'local' | 'google' | 'microsoft';

export type AuthIdentityMechanismProviderOptions = {
	inputFactory: Type<IdentityInputFactoryContract<unknown, unknown>>;
	authenticator: Type<IdentityProviderContract<unknown, unknown>>;
	strategies?: Type<unknown>[];
};

export type AuthSessionProviderOptions = {
	mechanism: string;
	serializer: Type<SessionSerializerContract<AuthSessionData, unknown>>;
	resolver: Type<SessionResolverContract<unknown, AuthSessionData>>;
	strategies?: Type<unknown>[];
};

export type AuthModuleProviderOptions = {
	providers?: Provider[];
	local?: AuthIdentityMechanismProviderOptions;
	google?: AuthIdentityMechanismProviderOptions;
	microsoft?: AuthIdentityMechanismProviderOptions;
	sessionBuilder: Type<SessionBuilderContract<unknown, AuthSessionData>>;
	session: AuthSessionProviderOptions;
};

@Global()
@Module({})
export class AuthModule {

	static forRoot(options: AuthModuleProviderOptions): DynamicModule {
		assertAuthModuleOptions(options);

		const providers: Provider[] = [
			...(options.providers || []),
			...createIdentityMechanismProviders(options),
			{
				provide: SessionBuilder(),
				useClass: options.sessionBuilder,
			},
			{
				provide: SessionSerializer(options.session.mechanism),
				useClass: options.session.serializer,
			},
			{
				provide: SessionResolver(options.session.mechanism),
				useClass: options.session.resolver,
			},
			...(options.session.strategies || []),
		];

		return {
			exports: [...providers, PassportModule],
			global: true,
			imports: [PassportModule.register({ session: false })],
			module: AuthModule,
			providers,
		};
	}

}

function createIdentityMechanismProviders(options: AuthModuleProviderOptions): Provider[] {
	return getConfiguredIdentityMechanisms(options).flatMap(([mechanism, mechanismOptions]) => {
		const strategies = mechanismOptions.strategies || getDefaultStrategiesForMechanism(mechanism);

		return [
			{
				provide: IdentityInputFactory(mechanism),
				useClass: mechanismOptions.inputFactory,
			},
			{
				provide: IdentityProvider(mechanism),
				useClass: mechanismOptions.authenticator,
			},
			...strategies,
		];
	});
}

function getDefaultStrategiesForMechanism(mechanism: AuthIdentityMechanism): Type<unknown>[] {
	if (mechanism === 'local') {
		return [LocalStrategy];
	}

	return [];
}

function getConfiguredIdentityMechanisms(options: AuthModuleProviderOptions): Array<[AuthIdentityMechanism, AuthIdentityMechanismProviderOptions]> {
	const configuredMechanisms: Array<[AuthIdentityMechanism, AuthIdentityMechanismProviderOptions | undefined]> = [
		['local', options.local],
		['google', options.google],
		['microsoft', options.microsoft],
	];

	return configuredMechanisms.filter((entry): entry is [AuthIdentityMechanism, AuthIdentityMechanismProviderOptions] => !!entry[1]);
}

function assertAuthModuleOptions(options: AuthModuleProviderOptions): void {
	if (!options.sessionBuilder) {
		throw new Error('AuthModule.forRoot requires sessionBuilder');
	}
	if (!options.session?.mechanism) {
		throw new Error('AuthModule.forRoot requires session.mechanism');
	}
	if (!options.session.serializer) {
		throw new Error('AuthModule.forRoot requires session.serializer');
	}
	if (!options.session.resolver) {
		throw new Error('AuthModule.forRoot requires session.resolver');
	}
	if (!getConfiguredIdentityMechanisms(options).length) {
		throw new Error('AuthModule.forRoot requires at least one configured login method');
	}
}

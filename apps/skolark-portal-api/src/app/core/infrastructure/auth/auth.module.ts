import {
	DynamicModule,
	Global,
	Module,
	Provider,
	Type,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ConfigProvider, ConfigProviderAsyncOptions } from '../config/config.provider';
import { REQUEST_AUTH_PROPERTY } from './auth.constant';
import { AuthJwtConfig, AuthModuleConfig } from './auth.module.config';
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
import { GoogleStrategy } from './passport/google.strategy';
import { JwtStrategy, JwtStrategyOptions } from './passport/jwt.strategy';
import { LocalStrategy } from './passport/local.strategy';
import { MicrosoftStrategy } from './passport/microsoft.strategy';
import { PassportExpressSessionSerializer } from './transport/express-session/passport.express-session.serializer';
import { RedisExpressSessionRevoker } from './transport/express-session/redis.express-session.revoker';
import { JwtSessionTransportService } from './transport/jwt/jwt-session-transport.service';
import type { JwtSessionPayload } from './transport/jwt/model/jwt-session-payload.model';

export type AuthIdentityMechanism = 'local' | 'google' | 'microsoft';

export type AuthIdentityMechanismProviderOptions = {
	inputFactory: Type<IdentityInputFactoryContract<unknown, unknown>>;
	authenticator: Type<IdentityProviderContract<unknown, unknown>>;
	strategies?: Type<unknown>[];
};

export type AuthModuleProviderOptions = {
	providers?: Provider[];
	local?: AuthIdentityMechanismProviderOptions;
	google?: AuthIdentityMechanismProviderOptions;
	microsoft?: AuthIdentityMechanismProviderOptions;
	expressSession: {
		sessionResolver: Type<SessionResolverContract<string, AuthSessionData>>;
		sessionSerializer: Type<SessionSerializerContract<AuthSessionData, string>>;
	};
	jwt: {
		sessionResolver: Type<SessionResolverContract<JwtSessionPayload, AuthSessionData>>;
		sessionSerializer: Type<SessionSerializerContract<AuthSessionData, JwtSessionPayload>>;
	};
	sessionBuilder: Type<SessionBuilderContract<unknown, AuthSessionData>>;
};

export type AuthModuleAsyncOptions = ConfigProviderAsyncOptions<AuthModuleConfig> & AuthModuleProviderOptions;

@Global()
@Module({})
export class AuthModule {

	static forRootAsync(options: AuthModuleAsyncOptions): DynamicModule {
		assertAuthModuleOptions(options);

		const providers: Provider[] = [
			ConfigProvider.createAsync(AuthModuleConfig, options, { preserveUnknownFields: true }),
			{
				provide: AuthJwtConfig,
				inject: [AuthModuleConfig],
				useFactory: (config: AuthModuleConfig) => AuthJwtConfig.create({
					accessTokenExpiresIn: '1d',
					refreshTokenExpiresIn: '356d',
					...config.jwt,
				}),
			},
			...(options.providers || []),
			...createIdentityMechanismProviders(options),
			{
				provide: SessionBuilder(),
				useClass: options.sessionBuilder,
			},
			{
				provide: SessionSerializer('jwt'),
				useClass: options.jwt.sessionSerializer,
			},
			{
				provide: SessionResolver('jwt'),
				useClass: options.jwt.sessionResolver,
			},
			{
				provide: SessionSerializer('express-session'),
				useClass: options.expressSession.sessionSerializer,
			},
			{
				provide: SessionResolver('express-session'),
				useClass: options.expressSession.sessionResolver,
			},
			PassportExpressSessionSerializer,
			RedisExpressSessionRevoker,
			JwtSessionTransportService,
			{
				provide: JwtStrategyOptions,
				inject: [AuthJwtConfig],
				useFactory: (config: AuthJwtConfig) => JwtStrategyOptions.create({ jwtSecret: config.secret }),
			},
			JwtStrategy,
		];

		return {
			exports: [...providers, PassportModule],
			global: true,
			imports: [
				PassportModule.register({
					property: REQUEST_AUTH_PROPERTY,
					session: true,
				}),
				JwtModule.registerAsync({
					inject: [AuthJwtConfig],
					useFactory: (config: AuthJwtConfig) => ({ secret: config.secret }),
				}),
				...(options.imports || []),
			],
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
	switch (mechanism) {
		case 'google': return [GoogleStrategy];
		case 'microsoft': return [MicrosoftStrategy];
		case 'local':
		default: return [LocalStrategy];
	}
}

function getConfiguredIdentityMechanisms(options: AuthModuleProviderOptions): Array<[AuthIdentityMechanism, AuthIdentityMechanismProviderOptions]> {
	const configuredMechanisms: Array<[AuthIdentityMechanism, AuthIdentityMechanismProviderOptions | undefined]> = [
		['local', options.local],
		['google', options.google],
		['microsoft', options.microsoft],
	];

	return configuredMechanisms.filter((entry): entry is [AuthIdentityMechanism, AuthIdentityMechanismProviderOptions] => !!entry[1]);
}

function assertAuthModuleOptions(options: AuthModuleAsyncOptions): void {
	if (!options.useFactory) {
		throw new Error('AuthModule.forRootAsync requires useFactory config options');
	}
	if (!options.sessionBuilder) {
		throw new Error('AuthModule.forRootAsync requires sessionBuilder');
	}
	if (!options.expressSession?.sessionSerializer) {
		throw new Error('AuthModule.forRootAsync requires expressSession.sessionSerializer');
	}
	if (!options.expressSession.sessionResolver) {
		throw new Error('AuthModule.forRootAsync requires expressSession.sessionResolver');
	}
	if (!options.jwt?.sessionSerializer) {
		throw new Error('AuthModule.forRootAsync requires jwt.sessionSerializer');
	}
	if (!options.jwt.sessionResolver) {
		throw new Error('AuthModule.forRootAsync requires jwt.sessionResolver');
	}
	if (!getConfiguredIdentityMechanisms(options).length) {
		throw new Error('AuthModule.forRootAsync requires at least one configured login method');
	}
}

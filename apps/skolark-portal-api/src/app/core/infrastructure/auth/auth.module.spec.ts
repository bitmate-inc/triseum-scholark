import { AuthModule } from './auth.module';
import type { IdentityInputFactory, IdentityProvider } from './contract/auth.identity.contract';
import type {
	SessionBuilder,
	SessionResolver,
	SessionSerializer
} from './contract/auth.session.contract';
import {
	IdentityInputFactory as IdentityInputFactoryToken,
	IdentityProvider as IdentityProviderToken,
	SessionBuilder as SessionBuilderToken,
	SessionResolver as SessionResolverToken,
	SessionSerializer as SessionSerializerToken,
} from './di/auth.token';
import { AuthSessionData } from './model/auth.session.model';
import { LocalStrategy } from './passport/local.strategy';
import type { JwtSessionPayload } from './transport/jwt/model/jwt-session-payload.model';

class TestInputFactory implements IdentityInputFactory {

	create(source: unknown): unknown {
		return source;
	}

}

class TestIdentityProvider implements IdentityProvider {

	authenticate(input: unknown): Promise<unknown> {
		return Promise.resolve(input);
	}

}

class TestSessionBuilder implements SessionBuilder {

	build(): AuthSessionData {
		return AuthSessionData.create({ user: { id: 'user-id' } });
	}

}

class TestSessionSerializer implements SessionSerializer<AuthSessionData, string> {

	serialize(): string {
		return 'user-id';
	}

}

class TestSessionResolver implements SessionResolver<string, AuthSessionData> {

	resolve(): Promise<AuthSessionData> {
		return Promise.resolve(AuthSessionData.create({ user: { id: 'user-id' } }));
	}

}

class TestJwtSessionSerializer implements SessionSerializer<AuthSessionData, JwtSessionPayload> {

	serialize(): JwtSessionPayload {
		return { id: 'user-id' };
	}

}

class TestJwtSessionResolver implements SessionResolver<JwtSessionPayload, AuthSessionData> {

	resolve(): Promise<AuthSessionData> {
		return Promise.resolve(AuthSessionData.create({ user: { id: 'user-id' } }));
	}

}

function createOptions() {
	return {
		local: {
			authenticator: TestIdentityProvider,
			inputFactory: TestInputFactory,
		},
		expressSession: {
			sessionResolver: TestSessionResolver,
			sessionSerializer: TestSessionSerializer,
		},
		jwt: {
			sessionResolver: TestJwtSessionResolver,
			sessionSerializer: TestJwtSessionSerializer,
		},
		sessionBuilder: TestSessionBuilder,
		useFactory: () => ({ jwt: { secret: 'test-jwt-secret-at-least-32-characters' } }),
	};
}

describe(AuthModule.name, () => {
	it('requires at least one configured identity mechanism', () => {
		expect(() => AuthModule.forRootAsync({
			...createOptions(),
			local: undefined,
		})).toThrow('AuthModule.forRootAsync requires at least one configured login method');
	});

	it('binds identity and session implementations to transport tokens', () => {
		const dynamicModule = AuthModule.forRootAsync(createOptions());

		expect(dynamicModule.providers).toEqual(expect.arrayContaining([
			LocalStrategy,
			{ provide: IdentityInputFactoryToken('local'), useClass: TestInputFactory },
			{ provide: IdentityProviderToken('local'), useClass: TestIdentityProvider },
			{ provide: SessionBuilderToken(), useClass: TestSessionBuilder },
			{ provide: SessionSerializerToken('express-session'), useClass: TestSessionSerializer },
			{ provide: SessionResolverToken('express-session'), useClass: TestSessionResolver },
			{ provide: SessionSerializerToken('jwt'), useClass: TestJwtSessionSerializer },
			{ provide: SessionResolverToken('jwt'), useClass: TestJwtSessionResolver },
		]));
	});
});

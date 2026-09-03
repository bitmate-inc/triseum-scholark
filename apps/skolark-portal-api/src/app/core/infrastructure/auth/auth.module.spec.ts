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

class TestSessionSerializer implements SessionSerializer {

	serialize(): string {
		return 'session-token';
	}

}

class TestSessionResolver implements SessionResolver {

	resolve(): Promise<AuthSessionData> {
		return Promise.resolve(AuthSessionData.create({ user: { id: 'user-id' } }));
	}

}

class TestSessionStrategy {}

function createOptions() {
	return {
		local: {
			authenticator: TestIdentityProvider,
			inputFactory: TestInputFactory,
		},
		session: {
			mechanism: 'opaque',
			resolver: TestSessionResolver,
			serializer: TestSessionSerializer,
			strategies: [TestSessionStrategy],
		},
		sessionBuilder: TestSessionBuilder,
	};
}

describe(AuthModule.name, () => {
	it('requires at least one configured identity mechanism', () => {
		expect(() => AuthModule.forRoot({
			...createOptions(),
			local: undefined,
		})).toThrow('AuthModule.forRoot requires at least one configured login method');
	});

	it('binds identity and session implementations to mechanism tokens', () => {
		const dynamicModule = AuthModule.forRoot(createOptions());

		expect(dynamicModule.providers).toEqual(expect.arrayContaining([
			LocalStrategy,
			TestSessionStrategy,
			{ provide: IdentityInputFactoryToken('local'), useClass: TestInputFactory },
			{ provide: IdentityProviderToken('local'), useClass: TestIdentityProvider },
			{ provide: SessionBuilderToken(), useClass: TestSessionBuilder },
			{ provide: SessionSerializerToken('opaque'), useClass: TestSessionSerializer },
			{ provide: SessionResolverToken('opaque'), useClass: TestSessionResolver },
		]));
	});
});

import {
	Inject,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-local';

import type { IdentityInputFactory as IdentityInputFactoryContract, IdentityProvider as IdentityProviderContract } from '../contract/auth.identity.contract';
import type { SessionBuilder as SessionBuilderContract } from '../contract/auth.session.contract';
import {
	IdentityInputFactory,
	IdentityProvider,
	SessionBuilder
} from '../di/auth.token';
import { AuthSessionData } from '../model/auth.session.model';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {

	constructor(
		@Inject(IdentityInputFactory('local'))
		private readonly identityInputFactory: IdentityInputFactoryContract<Request, unknown>,
		@Inject(IdentityProvider('local'))
		private readonly identityProvider: IdentityProviderContract<unknown, unknown>,
		@Inject(SessionBuilder())
		private readonly sessionBuilder: SessionBuilderContract<unknown, AuthSessionData>,
	) {
		super({
			passwordField: 'password',
			passReqToCallback: true,
			usernameField: 'email',
		});
	}

	async validate(request: Request): Promise<AuthSessionData> {
		const input = await this.identityInputFactory.create(request);
		const identity = await this.identityProvider.authenticate(input);

		if (!identity) {
			throw new UnauthorizedException('Invalid email or password');
		}

		return this.sessionBuilder.build(identity);
	}

}

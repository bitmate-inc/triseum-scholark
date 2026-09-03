import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-custom';

import type { SessionResolver as SessionResolverContract } from '../../../infrastructure/auth/contract/auth.session.contract';
import { SessionResolver } from '../../../infrastructure/auth/di/auth.token';
import type { AuthSessionData } from '../../../infrastructure/auth/model/auth.session.model';
import { User } from '../../user/model/user.entity';
import { SessionCookieService } from '../service/session.cookie.service';

@Injectable()
export class UserOpaqueSessionStrategy extends PassportStrategy(Strategy, 'session') {

	constructor(
		@Inject(SessionResolver('opaque'))
		private readonly sessionResolver: SessionResolverContract<string | undefined, AuthSessionData>,
		private readonly sessionCookieService: SessionCookieService,
	) {
		super();
	}

	async validate(request: Request): Promise<User | undefined> {
		const session = await this.sessionResolver.resolve(
			this.sessionCookieService.read(request),
		);

		return session?.user as User | undefined;
	}

}

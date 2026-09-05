import {
	Inject,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { StaticFactory } from '../../../../../lib/factory/static.factory';
import type { SessionResolver as SessionResolverContract } from '../contract/auth.session.contract';
import { SessionResolver } from '../di/auth.token';
import type { AuthSessionData } from '../model/auth.session.model';
import type { JwtSessionPayload } from '../transport/jwt/model/jwt-session-payload.model';

@Injectable()
export class JwtStrategyOptions extends StaticFactory {

	jwtSecret!: string;

}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

	constructor(
		options: JwtStrategyOptions,
		@Inject(SessionResolver('jwt'))
		private readonly sessionResolver: SessionResolverContract<JwtSessionPayload, AuthSessionData>,
	) {
		super({
			ignoreExpiration: false,
			jwtFromRequest: ExtractJwt.fromExtractors([
				ExtractJwt.fromUrlQueryParameter('accessToken'),
				ExtractJwt.fromAuthHeaderAsBearerToken(),
			]),
			secretOrKey: options.jwtSecret,
		});
	}

	async validate(payload: JwtSessionPayload): Promise<AuthSessionData> {
		const session = await this.sessionResolver.resolve(payload);
		if (!session) {
			throw new UnauthorizedException();
		}
		return session;
	}

}
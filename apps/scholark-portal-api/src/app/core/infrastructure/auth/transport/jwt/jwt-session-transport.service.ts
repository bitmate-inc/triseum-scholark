import { Inject, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import { AuthJwtConfig } from '../../auth.module.config';
import type { SessionResolver as SessionResolverContract, SessionSerializer as SessionSerializerContract } from '../../contract/auth.session.contract';
import { SessionResolver, SessionSerializer } from '../../di/auth.token';
import type { AuthSessionData } from '../../model/auth.session.model';
import type { JwtSessionPayload } from './model/jwt-session-payload.model';
import { JwtSessionToken } from './model/jwt-session-token.model';

@Injectable()
export class JwtSessionTransportService {

	constructor(
		private readonly jwtService: JwtService,
		private readonly jwtConfig: AuthJwtConfig,
		@Inject(SessionResolver('jwt'))
		private readonly sessionResolver: SessionResolverContract<JwtSessionPayload, AuthSessionData>,
		@Inject(SessionSerializer('jwt'))
		private readonly sessionSerializer: SessionSerializerContract<AuthSessionData, JwtSessionPayload>,
	) {}

	authorizeJwt(payload: JwtSessionPayload): Promise<AuthSessionData | undefined> {
		return this.sessionResolver.resolve(payload);
	}

	async createSessionToken(session: AuthSessionData): Promise<JwtSessionToken> {
		return JwtSessionToken.create({
			accessToken: await this.createAccessToken(session),
			refreshToken: await this.createRefreshToken(session),
		});
	}

	async refreshSessionToken(session: AuthSessionData): Promise<JwtSessionToken> {
		return JwtSessionToken.create({ accessToken: await this.createAccessToken(session) });
	}

	createAccessToken(session: AuthSessionData): Promise<string> {
		return this.jwtService.signAsync(this.sessionSerializer.serialize(session), {
			expiresIn: this.jwtConfig.accessTokenExpiresIn as JwtSignOptions['expiresIn'],
		});
	}

	createRefreshToken(session: AuthSessionData): Promise<string> {
		return this.jwtService.signAsync(this.sessionSerializer.serialize(session), {
			expiresIn: this.jwtConfig.refreshTokenExpiresIn as JwtSignOptions['expiresIn'],
		});
	}

}
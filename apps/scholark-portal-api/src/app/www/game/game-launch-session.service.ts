import {
	Inject,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { RedisClientType } from '@redis/client';

import authConfig from '../../../config/auth';
import gameProxyConfig from '../../../config/game-proxy';
import { GameLicense } from '../../core/feature/game/model/game.license.entity';
import { GameLicenseRepository } from '../../core/feature/game/repository/game.license.repository';
import { RedisClient } from '../../core/infrastructure/redis/redis.module';

const launchAudience = 'scholark-game-launch';
const gameAudience = 'scholark-game-api';
const tokenIssuer = 'scholark-portal-api';

export type GameSessionClaims = {
	gameVariantId: string;
	gameVersionId: string;
	licenseId: string;
	purpose: 'game_session';
	sub: string;
};

type GameLaunchTicketClaims = {
	gameVariantId: string;
	gameVersionId: string;
	licenseId: string;
	purpose: 'game_launch';
	sub: string;
	exp?: number;
	iss?: string;
	aud?: string | string[];
	jti?: string;
};

@Injectable()
export class GameLaunchSessionService {

	constructor(
		private readonly jwtService: JwtService,
		private readonly gameLicenseRepository: GameLicenseRepository,
		@Inject(gameProxyConfig.KEY) private readonly gameProxy: ConfigType<typeof gameProxyConfig>,
		@Inject(authConfig.KEY) private readonly auth: ConfigType<typeof authConfig>,
		@Inject(RedisClient()) private readonly redisClient: RedisClientType,
	) {}

	async exchangeLaunchTicket(launchTicket: string): Promise<{ license: GameLicense; sessionToken: string; sessionTtlSeconds: number }> {
		let ticket: GameLaunchTicketClaims;
		try {
			ticket = await this.jwtService.verifyAsync<GameLaunchTicketClaims>(launchTicket, {
				audience: launchAudience,
				issuer: tokenIssuer,
				secret: this.auth.jwt.secret,
			});
		} catch {
			throw new UnauthorizedException('Invalid game launch ticket');
		}

		if (ticket.purpose !== 'game_launch' || !ticket.sub || !ticket.licenseId || !ticket.gameVersionId || !ticket.gameVariantId || !ticket.jti || !ticket.exp) {
			throw new UnauthorizedException('Invalid game launch ticket');
		}

		const license = await this.gameLicenseRepository.findOwnedById(ticket.sub, ticket.licenseId);
		if (!this.isMatchingActiveLicense(license, ticket)) {
			throw new UnauthorizedException('Game license is unavailable');
		}

		const remainingTicketTtl = Math.floor(ticket.exp - Date.now() / 1000);
		if (remainingTicketTtl <= 0) {
			throw new UnauthorizedException('Game launch ticket has expired');
		}

		const consumeResult = await this.redisClient.set(
			`scholark:game:launch-ticket:${ticket.jti}`,
			'consumed',
			{
				condition: 'NX',
				expiration: { type: 'EX', value: remainingTicketTtl },
			},
		);
		if (consumeResult !== 'OK') {
			throw new UnauthorizedException('Game launch ticket has already been used');
		}

		const now = Date.now();
		const licenseTtl = Math.floor((license!.endAt.getTime() - now) / 1000);
		const sessionTtlSeconds = Math.min(this.gameProxy.sessionTtlSeconds, licenseTtl);
		if (sessionTtlSeconds <= 0) {
			throw new UnauthorizedException('Game license is unavailable');
		}

		const sessionToken = await this.jwtService.signAsync({
			gameVariantId: ticket.gameVariantId,
			gameVersionId: ticket.gameVersionId,
			licenseId: ticket.licenseId,
			purpose: 'game_session',
			sub: ticket.sub,
		}, {
			audience: gameAudience,
			expiresIn: sessionTtlSeconds,
			issuer: tokenIssuer,
			secret: this.auth.jwt.secret,
		});

		return { license: license!, sessionToken, sessionTtlSeconds };
	}

	async authorizeGameSession(cookieHeader?: string): Promise<GameLicense> {
		const token = readCookie(cookieHeader, this.gameProxy.cookieName);
		if (!token) {
			throw new UnauthorizedException('Game session is required');
		}

		let session: GameSessionClaims;
		try {
			session = await this.jwtService.verifyAsync<GameSessionClaims>(token, {
				audience: gameAudience,
				issuer: tokenIssuer,
				secret: this.auth.jwt.secret,
			});
		} catch {
			throw new UnauthorizedException('Game session is invalid or expired');
		}

		if (session.purpose !== 'game_session' || !session.sub || !session.licenseId || !session.gameVersionId || !session.gameVariantId) {
			throw new UnauthorizedException('Game session is invalid');
		}

		const license = await this.gameLicenseRepository.findOwnedById(session.sub, session.licenseId);
		if (!this.isMatchingActiveLicense(license, session)) {
			throw new UnauthorizedException('Game license is unavailable');
		}

		return license!;
	}

	getLicensedUpstream(license: GameLicense): URL {
		const upstream = new URL(license.gameVariant.gameVersion.runUrl);
		if (upstream.username || upstream.password || upstream.hash) {
			throw new UnauthorizedException('Game upstream URL is invalid');
		}
		if (upstream.protocol === 'http:' && !this.gameProxy.allowHttpUpstream) {
			throw new UnauthorizedException('HTTP game upstreams are disabled');
		}

		return upstream;
	}

	get gameSessionCookieName(): string {
		return this.gameProxy.cookieName;
	}

	private isMatchingActiveLicense(
		license: GameLicense | undefined,
		claims: Pick<GameSessionClaims, 'gameVariantId' | 'gameVersionId'> & { licenseId: string },
	): license is GameLicense {
		return Boolean(
			license
				&& license.id === claims.licenseId
				&& license.isActive()
				&& license.gameVariant.id === claims.gameVariantId
				&& license.gameVariant.gameVersion.id === claims.gameVersionId
				&& license.gameVariant.gameVersion.isPublished(),
		);
	}

}

function readCookie(cookieHeader: string | undefined, cookieName: string): string | undefined {
	if (!cookieHeader) {
		return undefined;
	}

	for (const cookie of cookieHeader.split(';')) {
		const separatorIndex = cookie.indexOf('=');
		if (separatorIndex < 0 || cookie.slice(0, separatorIndex).trim() !== cookieName) {
			continue;
		}

		try {
			return decodeURIComponent(cookie.slice(separatorIndex + 1).trim());
		} catch {
			return undefined;
		}
	}

	return undefined;
}
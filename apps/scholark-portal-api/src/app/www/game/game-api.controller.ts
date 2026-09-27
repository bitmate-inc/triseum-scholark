import {
	Body,
	Controller,
	ForbiddenException,
	Get,
	Headers,
	HttpCode,
	Inject,
	Post,
	Put,
	Res,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import gameProxyConfig from '../../../config/game-proxy';
import { GamePlayEventDto, GameStateDto } from './game-interaction.dto';
import { GameInteractionService } from './game-interaction.service';
import { GameLaunchExchangeDto } from './game-launch-exchange.dto';
import { GameLaunchSessionService } from './game-launch-session.service';

@ApiTags('Game Integration')
@Controller('api/v1/game')
export class GameApiController {

	constructor(
		private readonly gameLaunchSessionService: GameLaunchSessionService,
		private readonly gameInteractionService: GameInteractionService,
		@Inject(gameProxyConfig.KEY) private readonly gameProxy: ConfigType<typeof gameProxyConfig>,
	) {}

	@Post('launch/exchange')
	@ApiExcludeEndpoint()
	async exchangeLaunchTicket(
		@Body() body: GameLaunchExchangeDto,
		@Res() response: Response,
	): Promise<void> {
		const { license, sessionToken, sessionTtlSeconds } = await this.gameLaunchSessionService.exchangeLaunchTicket(body.launchTicket);
		if (!this.gameProxy.publicOrigin) {
			response.status(503).send('Game proxy origin is not configured');
			return;
		}

		response.cookie(this.gameProxy.cookieName, sessionToken, {
			httpOnly: true,
			maxAge: sessionTtlSeconds * 1000,
			path: '/api/v1/game/',
			sameSite: 'lax',
			secure: new URL(this.gameProxy.publicOrigin).protocol === 'https:',
		});
		response.redirect(303, `/api/v1/game/content/${license.id}/`);
	}

	@Get('config')
	@ApiExcludeEndpoint()
	getConfiguration(@Headers('cookie') cookieHeader?: string) {
		return this.gameInteractionService.getConfiguration(cookieHeader);
	}

	@Post('events')
	@HttpCode(202)
	@ApiExcludeEndpoint()
	recordEvent(
		@Headers('cookie') cookieHeader: string | undefined,
		@Headers('origin') origin: string | undefined,
		@Body() body: GamePlayEventDto,
	) {
		this.assertGameOrigin(origin);

		return this.gameInteractionService.recordEvent(cookieHeader, body);
	}

	@Get('state')
	@ApiExcludeEndpoint()
	getState(@Headers('cookie') cookieHeader?: string) {
		return this.gameInteractionService.getState(cookieHeader);
	}

	@Put('state')
	@ApiExcludeEndpoint()
	saveState(
		@Headers('cookie') cookieHeader: string | undefined,
		@Headers('origin') origin: string | undefined,
		@Body() body: GameStateDto,
	) {
		this.assertGameOrigin(origin);

		return this.gameInteractionService.saveState(cookieHeader, body);
	}

	private assertGameOrigin(origin?: string): void {
		if (!origin || origin !== this.gameProxy.publicOrigin) {
			throw new ForbiddenException('Game requests must come from the configured game origin');
		}
	}

}
import { ForbiddenException } from '@nestjs/common';

import { GameApiController } from './game-api.controller';
import { GameInteractionService } from './game-interaction.service';
import { GameLaunchSessionService } from './game-launch-session.service';

describe(GameApiController.name, () => {
	it('sets a host-only scoped HttpOnly session cookie and redirects after ticket exchange', async () => {
		const gameLaunchSessionService = {
			exchangeLaunchTicket: jest.fn().mockResolvedValue({
				license: { id: 'license-id' },
				sessionToken: 'session-token',
				sessionTtlSeconds: 120,
			}),
		};
		const response = { cookie: jest.fn(), redirect: jest.fn() };
		const controller = new GameApiController(
			gameLaunchSessionService as unknown as GameLaunchSessionService,
			{} as GameInteractionService,
			{ cookieName: 'scholark_game', publicOrigin: 'https://games.example.test' } as never,
		);

		await controller.exchangeLaunchTicket({ launchTicket: 'launch-ticket' }, response as never);

		expect(response.cookie).toHaveBeenCalledWith('scholark_game', 'session-token', expect.objectContaining({
			httpOnly: true,
			maxAge: 120000,
			path: '/api/v1/game/',
			sameSite: 'lax',
			secure: true,
		}));
		expect(response.redirect).toHaveBeenCalledWith(303, '/api/v1/game/content/license-id/');
	});

	it('rejects state-changing requests from a different origin', () => {
		const gameInteractionService = { recordEvent: jest.fn() };
		const controller = new GameApiController(
			{} as GameLaunchSessionService,
			gameInteractionService as unknown as GameInteractionService,
			{ cookieName: 'scholark_game', publicOrigin: 'https://games.example.test' } as never,
		);

		expect(() => controller.recordEvent('scholark_game=token', 'https://attacker.example', {} as never)).toThrow(ForbiddenException);
		expect(gameInteractionService.recordEvent).not.toHaveBeenCalled();
	});
});
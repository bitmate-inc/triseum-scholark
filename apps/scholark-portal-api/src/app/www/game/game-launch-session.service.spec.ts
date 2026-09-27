import { UnauthorizedException } from '@nestjs/common';
import type { RedisClientType } from '@redis/client';

import { GameLicenseRepository } from '../../core/feature/game/repository/game.license.repository';
import { GameLaunchSessionService } from './game-launch-session.service';

const userId = '00000000-0000-4000-8000-000000000001';
const licenseId = '00000000-0000-4000-8000-000000000002';
const gameVariantId = '00000000-0000-4000-8000-000000000003';
const gameVersionId = '00000000-0000-4000-8000-000000000004';

function createService(consumeResult: string | null = 'OK') {
	const license = {
		endAt: new Date(Date.now() + 30 * 60 * 1000),
		gameVariant: {
			gameVersion: {
				id: gameVersionId,
				isPublished: () => true,
				runUrl: 'https://games.example.test/build/',
			},
			id: gameVariantId,
		},
		id: licenseId,
		isActive: () => true,
	};
	const repository = { findOwnedById: jest.fn().mockResolvedValue(license) };
	const jwtService = {
		signAsync: jest.fn().mockResolvedValue('game-session-token'),
		verifyAsync: jest.fn().mockResolvedValue({
			exp: Math.floor(Date.now() / 1000) + 45,
			gameVariantId,
			gameVersionId,
			jti: 'ticket-id',
			licenseId,
			purpose: 'game_launch',
			sub: userId,
		}),
	};
	const redisClient = { set: jest.fn().mockResolvedValue(consumeResult) };
	const service = new GameLaunchSessionService(
		jwtService as never,
		repository as unknown as GameLicenseRepository,
		{
			allowHttpUpstream: false,
			cookieName: 'scholark_game',
			sessionTtlSeconds: 3600,
		} as never,
		{ jwt: { secret: 'test-launch-secret' } } as never,
		redisClient as unknown as RedisClientType,
	);

	return { jwtService, license, redisClient, repository, service };
}

describe(GameLaunchSessionService.name, () => {
	it('atomically consumes a valid ticket and issues a license-bounded game session', async () => {
		const { jwtService, license, redisClient, repository, service } = createService();

		const result = await service.exchangeLaunchTicket('signed-launch-ticket');

		expect(result.license).toBe(license);
		expect(result.sessionToken).toBe('game-session-token');
		expect(result.sessionTtlSeconds).toBeLessThanOrEqual(1800);
		expect(repository.findOwnedById).toHaveBeenCalledWith(userId, licenseId);
		expect(redisClient.set).toHaveBeenCalledWith(
			'scholark:game:launch-ticket:ticket-id',
			'consumed',
			expect.objectContaining({ condition: 'NX' }),
		);
		expect(jwtService.signAsync).toHaveBeenCalledWith(
			expect.objectContaining({ purpose: 'game_session', sub: userId, licenseId, gameVersionId }),
			expect.objectContaining({ audience: 'scholark-game-api', issuer: 'scholark-portal-api' }),
		);
	});

	it('rejects a replayed ticket', async () => {
		const { service, redisClient } = createService(null);

		await expect(service.exchangeLaunchTicket('signed-launch-ticket')).rejects.toBeInstanceOf(UnauthorizedException);
		expect(redisClient.set).toHaveBeenCalledTimes(1);
	});

	it('rejects a ticket for a different Game Version before consuming it', async () => {
		const { jwtService, redisClient, service } = createService();
		(jwtService.verifyAsync as jest.Mock).mockResolvedValueOnce({
			exp: Math.floor(Date.now() / 1000) + 45,
			gameVariantId,
			gameVersionId: '00000000-0000-4000-8000-000000000005',
			jti: 'ticket-id',
			licenseId,
			purpose: 'game_launch',
			sub: userId,
		});

		await expect(service.exchangeLaunchTicket('signed-launch-ticket')).rejects.toBeInstanceOf(UnauthorizedException);
		expect(redisClient.set).not.toHaveBeenCalled();
	});

	it('uses the licensed Game Version runUrl without a deployment-wide origin list', () => {
		const { license, service } = createService();
		license.gameVariant.gameVersion.runUrl = 'https://publisher-cdn.example.test/build/';

		expect(service.getLicensedUpstream(license as never).toString()).toBe('https://publisher-cdn.example.test/build/');
	});
});
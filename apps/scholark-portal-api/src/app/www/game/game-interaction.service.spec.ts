import { PayloadTooLargeException } from '@nestjs/common';

import { GamePlayEvent } from '../../core/feature/game/model/game.play.event.entity';
import { GameInteractionService } from './game-interaction.service';
import { GameLaunchSessionService } from './game-launch-session.service';

describe(GameInteractionService.name, () => {
	it('records events idempotently against the exact licensed Game Version', async () => {
		const gameVersion = { id: 'version-id' };
		const license = {
			gameVariant: { gameVersion },
			id: 'license-id',
		};
		const entityManager = { upsert: jest.fn() };
		const sessionService = { authorizeGameSession: jest.fn().mockResolvedValue(license) };
		const service = new GameInteractionService(
			entityManager as never,
			sessionService as unknown as GameLaunchSessionService,
		);
		const event = {
			eventId: 'event-1',
			eventType: 'level.completed',
			occurredAt: '2026-01-02T03:04:05.000Z',
			payload: { level: 1 },
			schemaVersion: 1,
		};

		await expect(service.recordEvent('session=token', event)).resolves.toEqual({ accepted: true, eventId: 'event-1' });
		expect(entityManager.upsert).toHaveBeenCalledWith(
			GamePlayEvent,
			expect.objectContaining({
				eventId: 'event-1',
				gameLicense: license,
				gameVersion,
			}),
			expect.objectContaining({
				onConflictAction: 'ignore',
				onConflictFields: ['gameLicense', 'eventId'],
			}),
		);
	});

	it('rejects oversized state before attempting to persist it', async () => {
		const license = {
			gameVariant: { gameVersion: { id: 'version-id' } },
			id: 'license-id',
		};
		const entityManager = { upsert: jest.fn() };
		const sessionService = { authorizeGameSession: jest.fn().mockResolvedValue(license) };
		const service = new GameInteractionService(
			entityManager as never,
			sessionService as unknown as GameLaunchSessionService,
		);

		await expect(service.saveState('session=token', {
			schemaVersion: 1,
			state: { value: 'x'.repeat(1024 * 1024) },
		})).rejects.toBeInstanceOf(PayloadTooLargeException);
		expect(entityManager.upsert).not.toHaveBeenCalled();
	});
});
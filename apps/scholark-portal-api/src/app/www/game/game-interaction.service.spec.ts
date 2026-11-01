import { PayloadTooLargeException } from '@nestjs/common';

import { GamePlayEvent } from '../../core/feature/game/model/game.play.event.entity';
import { GameProgressSnapshot } from '../../core/feature/game/model/game.progress.snapshot.entity';
import type { GameProgressStructure } from '../../core/feature/game/model/game.progress.structure';
import { GameInteractionService } from './game-interaction.service';
import { GameLaunchSessionService } from './game-launch-session.service';

const testProgressStructure: GameProgressStructure = {
	schemaVersion: 1,
	sectionList: [{
		sectionIndex: '0',
		label: 'Act 1',
		metricList: [
			{ key: 'points', label: 'Points', pointsPossible: 120 },
			{ key: 'newPoints', label: 'New points' },
		],
	}],
};

describe(GameInteractionService.name, () => {
	it('records events idempotently against the exact licensed Game Version', async () => {
		const gameVersion = { id: 'version-id' };
		const license = {
			gameVersion,
			id: 'license-id',
		};
		const entityManager = { upsert: jest.fn() };
		const sessionService = { authorizeGameSession: jest.fn().mockResolvedValue(license) };
		const calculateGradeCommand = { execute: jest.fn() };
		const service = new GameInteractionService(
			entityManager as never,
			sessionService as unknown as GameLaunchSessionService,
			calculateGradeCommand as never,
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
			gameVersion: { id: 'version-id', progressStructure: testProgressStructure },
			id: 'license-id',
		};
		const entityManager = { upsert: jest.fn() };
		const sessionService = { authorizeGameSession: jest.fn().mockResolvedValue(license) };
		const calculateGradeCommand = { execute: jest.fn() };
		const service = new GameInteractionService(
			entityManager as never,
			sessionService as unknown as GameLaunchSessionService,
			calculateGradeCommand as never,
		);

		await expect(service.saveState('session=token', {
			schemaVersion: 1,
			state: { value: 'x'.repeat(1024 * 1024) },
		})).rejects.toBeInstanceOf(PayloadTooLargeException);
		expect(entityManager.upsert).not.toHaveBeenCalled();
	});

	it('replaces the progress snapshot for the authorized license', async () => {
		const license = {
			gameVersion: { id: 'version-id', progressStructure: testProgressStructure },
			id: 'license-id',
		};
		const entityManager = { upsert: jest.fn() };
		const sessionService = { authorizeGameSession: jest.fn().mockResolvedValue(license) };
		const calculateGradeCommand = { execute: jest.fn() };
		const service = new GameInteractionService(
			entityManager as never,
			sessionService as unknown as GameLaunchSessionService,
			calculateGradeCommand as never,
		);
		const progressData = {
			schemaVersion: 1,
			summary: { completionPercent: 54, metrics: { totalPoints: 108 } },
			sectionList: [{ sectionIndex: '0', metrics: { points: 120, newPoints: 40.5 } }],
		};

		const result = await service.saveProgress('session=token', progressData);

		expect(result).toMatchObject({ schemaVersion: 1, updatedAt: expect.any(Date) });
		expect(entityManager.upsert).toHaveBeenCalledWith(
			GameProgressSnapshot,
			expect.objectContaining({
				content: {
					sectionList: progressData.sectionList,
					summary: progressData.summary,
				},
				gameLicense: license,
				schemaVersion: 1,
				updatedAt: expect.any(Date),
			}),
			expect.objectContaining({
				onConflictAction: 'merge',
				onConflictFields: ['gameLicense'],
			}),
		);
	});

	it('rejects invalid section references and non-numeric metrics before persistence', async () => {
		const license = { gameVersion: { id: 'version-id', progressStructure: testProgressStructure }, id: 'license-id' };
		const entityManager = { upsert: jest.fn() };
		const sessionService = { authorizeGameSession: jest.fn().mockResolvedValue(license) };
		const calculateGradeCommand = { execute: jest.fn() };
		const service = new GameInteractionService(
			entityManager as never,
			sessionService as unknown as GameLaunchSessionService,
			calculateGradeCommand as never,
		);

		await expect(service.saveProgress('session=token', {
			schemaVersion: 1,
			sectionList: [{ sectionIndex: '9' }],
		})).rejects.toThrow('Unknown GameVersion section index: 9.');
		await expect(service.saveProgress('session=token', {
			schemaVersion: 1,
			summary: { metrics: { totalPoints: '108' as unknown as number } },
		})).rejects.toThrow('Game progress metrics must have valid names and finite numeric values');
		expect(entityManager.upsert).not.toHaveBeenCalled();
	});

	it('rejects oversized progress before attempting to persist it', async () => {
		const license = { gameVersion: { id: 'version-id' }, id: 'license-id' };
		const entityManager = { upsert: jest.fn() };
		const sessionService = { authorizeGameSession: jest.fn().mockResolvedValue(license) };
		const calculateGradeCommand = { execute: jest.fn() };
		const service = new GameInteractionService(
			entityManager as never,
			sessionService as unknown as GameLaunchSessionService,
			calculateGradeCommand as never,
		);
		const metrics = Object.fromEntries(
			Array.from({ length: 300 }, (_, index) => [`${'metric'.repeat(170)}-${index}`, index]),
		);

		await expect(service.saveProgress('session=token', {
			schemaVersion: 1,
			summary: { metrics },
		})).rejects.toBeInstanceOf(PayloadTooLargeException);
		expect(entityManager.upsert).not.toHaveBeenCalled();
	});
});
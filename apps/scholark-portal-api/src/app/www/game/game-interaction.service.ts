import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, PayloadTooLargeException } from '@nestjs/common';

import { GamePlayEvent } from '../../core/feature/game/model/game.play.event.entity';
import { GameState } from '../../core/feature/game/model/game.state.entity';
import { GameLaunchSessionService } from './game-launch-session.service';

@Injectable()
export class GameInteractionService {

	constructor(
		private readonly entityManager: EntityManager,
		private readonly gameLaunchSessionService: GameLaunchSessionService,
	) {}

	async getConfiguration(cookieHeader?: string) {
		const license = await this.gameLaunchSessionService.authorizeGameSession(cookieHeader);
		const gameVariant = license.gameVariant;
		const customization = license.customization;

		return {
			customization: customization?.isPublished() ? customization.content : undefined,
			gameVariantId: gameVariant.id!,
			gameVersionId: gameVariant.gameVersion.id!,
			publisherVersion: gameVariant.gameVersion.publisherVersion,
			runtimeConfiguration: gameVariant.runtimeConfiguration,
		};
	}

	async recordEvent(cookieHeader: string | undefined, eventData: {
		eventId: string;
		eventType: string;
		schemaVersion: number;
		payload: Record<string, unknown>;
		occurredAt: string;
	}): Promise<{ accepted: true; eventId: string }> {
		const license = await this.gameLaunchSessionService.authorizeGameSession(cookieHeader);
		assertJsonSize(eventData.payload, 256 * 1024, 'Game event payload is too large');

		await this.entityManager.upsert(GamePlayEvent, {
			eventId: eventData.eventId,
			eventType: eventData.eventType,
			gameLicense: license,
			gameVersion: license.gameVariant.gameVersion,
			occurredAt: new Date(eventData.occurredAt),
			payload: eventData.payload,
			schemaVersion: eventData.schemaVersion,
		}, {
			onConflictAction: 'ignore',
			onConflictFields: ['gameLicense', 'eventId'],
		});

		return { accepted: true, eventId: eventData.eventId };
	}

	async getState(cookieHeader?: string) {
		const license = await this.gameLaunchSessionService.authorizeGameSession(cookieHeader);
		const gameState = await this.entityManager.findOne(GameState, { gameLicense: license });

		return gameState ? {
			gameVersionId: gameState.gameVersion.id,
			savedAt: gameState.savedAt,
			schemaVersion: gameState.schemaVersion,
			state: gameState.content,
		} : {
			gameVersionId: license.gameVariant.gameVersion.id,
			savedAt: undefined,
			schemaVersion: undefined,
			state: null,
		};
	}

	async saveState(cookieHeader: string | undefined, stateData: {
		schemaVersion: number;
		state: Record<string, unknown>;
	}): Promise<{ savedAt: Date; schemaVersion: number }> {
		const license = await this.gameLaunchSessionService.authorizeGameSession(cookieHeader);
		assertJsonSize(stateData.state, 1024 * 1024, 'Game state payload is too large');
		const savedAt = new Date();

		await this.entityManager.upsert(GameState, {
			content: stateData.state,
			gameLicense: license,
			gameVersion: license.gameVariant.gameVersion,
			savedAt,
			schemaVersion: stateData.schemaVersion,
		}, {
			onConflictAction: 'merge',
			onConflictFields: ['gameLicense'],
		});

		return { savedAt, schemaVersion: stateData.schemaVersion };
	}

}

function assertJsonSize(value: Record<string, unknown>, maxByteLength: number, errorMessage: string): void {
	if (Buffer.byteLength(JSON.stringify(value), 'utf8') > maxByteLength) {
		throw new PayloadTooLargeException(errorMessage);
	}
}
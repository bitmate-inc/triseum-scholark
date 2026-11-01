import { EntityManager } from '@mikro-orm/postgresql';
import {
	BadRequestException,
	Injectable,
	PayloadTooLargeException
} from '@nestjs/common';

import { CalculateGameLicenseGradeCommand } from '../../core/feature/education/command/calculate.game.license.grade.command';
import { GamePlayEvent } from '../../core/feature/game/model/game.play.event.entity';
import { GameProgressSnapshot, type GameProgressSnapshotContent } from '../../core/feature/game/model/game.progress.snapshot.entity';
import type { GameProgressStructure } from '../../core/feature/game/model/game.progress.structure';
import { GameState } from '../../core/feature/game/model/game.state.entity';
import type { GameProgressSnapshotDto } from './game-interaction.dto';
import { GameLaunchSessionService } from './game-launch-session.service';

@Injectable()
export class GameInteractionService {

	constructor(
		private readonly entityManager: EntityManager,
		private readonly gameLaunchSessionService: GameLaunchSessionService,
		private readonly calculateGameLicenseGradeCommand: CalculateGameLicenseGradeCommand,
	) {}

	async getConfiguration(cookieHeader?: string) {
		const license = await this.gameLaunchSessionService.authorizeGameSession(cookieHeader);
		const customization = license.customization;

		return {
			customization: customization?.isPublished() ? customization.content : undefined,
			courseType: license.courseType,
			gameVersionId: license.gameVersion.id!,
			language: license.language,
			progressStructure: license.gameVersion.progressStructure,
			publisherVersion: license.gameVersion.publisherVersion,
		};
	}

	async saveProgress(cookieHeader: string | undefined, progressData: GameProgressSnapshotDto): Promise<{ updatedAt: Date; schemaVersion: number }> {
		const license = await this.gameLaunchSessionService.authorizeGameSession(cookieHeader);
		assertJsonSize(progressData, 256 * 1024, 'Game progress payload is too large');
		assertValidProgressData(progressData, license.gameVersion.progressStructure);

		const updatedAt = new Date();
		const content: GameProgressSnapshotContent = {
			summary: progressData.summary,
			sectionList: progressData.sectionList,
		};

		await this.entityManager.upsert(GameProgressSnapshot, {
			content,
			gameLicense: license,
			schemaVersion: progressData.schemaVersion,
			updatedAt,
		}, {
			onConflictAction: 'merge',
			onConflictFields: ['gameLicense'],
		});
		await this.calculateGameLicenseGradeCommand.execute(license.id!);

		return { updatedAt, schemaVersion: progressData.schemaVersion };
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
			gameVersion: license.gameVersion,
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
			gameVersionId: license.gameVersion.id,
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
			gameVersion: license.gameVersion,
			savedAt,
			schemaVersion: stateData.schemaVersion,
		}, {
			onConflictAction: 'merge',
			onConflictFields: ['gameLicense'],
		});

		return { savedAt, schemaVersion: stateData.schemaVersion };
	}

}

function assertValidProgressData(
	progressData: GameProgressSnapshotDto,
	progressStructure?: GameProgressStructure,
): void {
	assertNumericMetricMap(progressData.summary?.metrics);

	const sectionList = progressData.sectionList ?? [];
	if (progressStructure && progressData.schemaVersion !== progressStructure.schemaVersion) {
		throw new BadRequestException('Game progress schema version does not match the GameVersion structure.');
	}
	if (sectionList.length > 0 && !progressStructure) {
		throw new BadRequestException('Game progress structure is not configured for this GameVersion.');
	}

	const sectionDefinitionByIndex = new Map(
		(progressStructure?.sectionList ?? []).map((sectionDefinition) => [sectionDefinition.sectionIndex, sectionDefinition]),
	);
	const sectionIndexSet = new Set<string>();
	for (const section of sectionList) {
		if (sectionIndexSet.has(section.sectionIndex)) {
			throw new BadRequestException('Game progress section indices must be unique');
		}

		assertNumericMetricMap(section.metrics);
		const sectionDefinition = sectionDefinitionByIndex.get(section.sectionIndex);
		if (!sectionDefinition) {
			throw new BadRequestException(`Unknown GameVersion section index: ${section.sectionIndex}.`);
		}
		const allowedMetricKeySet = new Set(sectionDefinition.metricList.map((metric) => metric.key));
		for (const metricKey of Object.keys(section.metrics ?? {})) {
			if (!allowedMetricKeySet.has(metricKey)) {
				throw new BadRequestException(`Unknown metric ${metricKey} for section ${section.sectionIndex}.`);
			}
		}
		sectionIndexSet.add(section.sectionIndex);
	}
}

function assertNumericMetricMap(metrics: Record<string, number | null> | null | undefined): void {
	if (metrics == null) {
		return;
	}

	for (const [key, value] of Object.entries(metrics)) {
		if (key.trim().length === 0 || key.length > 200 || (value !== null && (typeof value !== 'number' || !Number.isFinite(value)))) {
			throw new BadRequestException('Game progress metrics must have valid names and finite numeric values');
		}
	}
}

function assertJsonSize(value: object, maxByteLength: number, errorMessage: string): void {
	const serializedValue = JSON.stringify(value);
	if (serializedValue === undefined || Buffer.byteLength(serializedValue, 'utf8') > maxByteLength) {
		throw new PayloadTooLargeException(errorMessage);
	}
}
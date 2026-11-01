import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import type { GameProgressStructure } from '../../game/model/game.progress.structure';
import { validateGameProgressStructure } from '../../game/model/game.progress.structure';
import { GameVersion } from '../../game/model/game.version.entity';
import { GameRepository } from '../../game/repository/game.repository';
import { GameVersionRepository } from '../../game/repository/game.version.repository';

export interface CreateAdminGameVersionCommandData {
	description?: string;
	gameId: string;
	publishedAt?: Date;
	publisherVersion: string;
	progressStructure?: GameProgressStructure;
	runUrl: string;
}

@Injectable()
export class CreateAdminGameVersionCommand {

	constructor(
		private readonly gameRepository: GameRepository,
		private readonly gameVersionRepository: GameVersionRepository,
	) {}

	async execute(data: CreateAdminGameVersionCommandData): Promise<GameVersion> {
		const structureValidationError = data.progressStructure
			? validateGameProgressStructure(data.progressStructure)
			: undefined;
		if (structureValidationError) {
			throw new BadRequestException(structureValidationError);
		}

		const game = await this.gameRepository.findOneBy({ id: data.gameId });
		if (!game) {
			throw new NotFoundException('Game not found.');
		}

		const publisherVersion = data.publisherVersion.trim();
		if (!publisherVersion) {
			throw new BadRequestException('Publisher version is required.');
		}
		if (await this.gameVersionRepository.findOneBy({ game: game.id, publisherVersion })) {
			throw new ConflictException('This publisher version already exists for the game.');
		}
		const version = this.gameVersionRepository.create({
			description: data.description?.trim() || undefined,
			game,
			publishedAt: data.publishedAt,
			publisherVersion,
			progressStructure: data.progressStructure,
			runUrl: data.runUrl.trim(),
		});
		await this.gameVersionRepository.save(version);
		return version;
	}

}
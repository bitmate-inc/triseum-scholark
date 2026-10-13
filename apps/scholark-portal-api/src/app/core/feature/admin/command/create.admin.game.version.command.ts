import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { GameVersion } from '../../game/model/game.version.entity';
import { GameRepository } from '../../game/repository/game.repository';
import { GameVersionRepository } from '../../game/repository/game.version.repository';

export interface CreateAdminGameVersionCommandData {
	description?: string;
	gameId: string;
	publishedAt?: Date;
	publisherVersion: string;
	runUrl: string;
}

@Injectable()
export class CreateAdminGameVersionCommand {

	constructor(
		private readonly gameRepository: GameRepository,
		private readonly gameVersionRepository: GameVersionRepository,
	) {}

	async execute(data: CreateAdminGameVersionCommandData): Promise<GameVersion> {
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
			runUrl: data.runUrl.trim(),
		});
		await this.gameVersionRepository.save(version);
		return version;
	}

}
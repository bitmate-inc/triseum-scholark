import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { GameVersion } from '../../game/model/game.version.entity';
import { GameVersionRepository } from '../../game/repository/game.version.repository';

export interface UpdateAdminGameVersionCommandData {
	description?: string;
	publishedAt?: Date | null;
	publisherVersion?: string;
	runUrl?: string;
}

@Injectable()
export class UpdateAdminGameVersionCommand {

	constructor(
		private readonly gameVersionRepository: GameVersionRepository,
	) {}

	async execute(gameId: string, versionId: string, data: UpdateAdminGameVersionCommandData): Promise<GameVersion> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException('At least one game version field must be provided.');
		}

		const version = await this.gameVersionRepository.findOneBy({ id: versionId, game: gameId });
		if (!version) {
			throw new NotFoundException('Game version not found for this game.');
		}
		if (version.isPublished()) {
			throw new ConflictException('Published game versions are immutable.');
		}

		const publisherVersion = data.publisherVersion?.trim();
		if (publisherVersion && publisherVersion !== version.publisherVersion) {
			if (await this.gameVersionRepository.findOneBy({ game: gameId, publisherVersion })) {
				throw new ConflictException('This publisher version already exists for the game.');
			}
			version.publisherVersion = publisherVersion;
		}
		if (data.description !== undefined) {
			version.description = data.description.trim() || undefined;
		}
		if (data.runUrl !== undefined) {
			version.runUrl = data.runUrl.trim();
		}
		if (Object.prototype.hasOwnProperty.call(data, 'publishedAt')) {
			version.publishedAt = data.publishedAt ?? undefined;
		}
		await this.gameVersionRepository.save(version);
		return version;
	}

}
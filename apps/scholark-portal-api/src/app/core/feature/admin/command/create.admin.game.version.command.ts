import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Game } from '../../game/model/game.entity';
import { GameVariant, GameVariantMode } from '../../game/model/game.variant.entity';
import { GameVersion } from '../../game/model/game.version.entity';

export interface CreateAdminGameVersionCommandData {
	description?: string;
	gameId: string;
	publishedAt?: Date;
	publisherVersion: string;
	runUrl: string;
	variantList: { language: string; mode: GameVariantMode }[];
}

@Injectable()
export class CreateAdminGameVersionCommand {

	constructor(
		@InjectRepository(Game)
		private readonly gameRepository: EntityRepository<Game>,
		@InjectRepository(GameVariant)
		private readonly gameVariantRepository: EntityRepository<GameVariant>,
		@InjectRepository(GameVersion)
		private readonly gameVersionRepository: EntityRepository<GameVersion>,
	) {}

	async execute(data: CreateAdminGameVersionCommandData): Promise<GameVersion> {
		const game = await this.gameRepository.findOne({ id: data.gameId });
		if (!game) {
			throw new NotFoundException('Game not found.');
		}

		const publisherVersion = data.publisherVersion.trim();
		if (!publisherVersion) {
			throw new BadRequestException('Publisher version is required.');
		}
		if (await this.gameVersionRepository.findOne({ game: game.id, publisherVersion })) {
			throw new ConflictException('This publisher version already exists for the game.');
		}
		if (data.variantList.length === 0) {
			throw new BadRequestException('At least one game variant is required.');
		}

		const variantKeySet = new Set<string>();
		const variantList = data.variantList.map((variant) => {
			const language = variant.language.trim();
			if (!language) {
				throw new BadRequestException('Variant language is required.');
			}
			const variantKey = `${language}\u0000${variant.mode}`;
			if (variantKeySet.has(variantKey)) {
				throw new ConflictException('Game variants must have unique language and mode pairs.');
			}
			variantKeySet.add(variantKey);
			return { language, mode: variant.mode };
		});

		const version = this.gameVersionRepository.create({
			description: data.description?.trim() || undefined,
			game,
			publishedAt: data.publishedAt,
			publisherVersion,
			runUrl: data.runUrl.trim(),
		});
		const entityManager = this.gameVersionRepository.getEntityManager();
		entityManager.persist(version);
		for (const variant of variantList) {
			entityManager.persist(this.gameVariantRepository.create({
				gameVersion: version,
				language: variant.language,
				mode: variant.mode,
			}));
		}
		await entityManager.flush();
		return version;
	}

}
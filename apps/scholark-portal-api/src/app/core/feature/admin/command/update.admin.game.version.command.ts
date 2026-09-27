import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { InstitutionGameOffer } from '../../education/model/institution.game.offer.entity';
import { GameVariant, GameVariantMode } from '../../game/model/game.variant.entity';
import { GameVersion } from '../../game/model/game.version.entity';
import { PublicGameOffer } from '../../game/model/public.game.offer.entity';

export interface UpdateAdminGameVersionCommandData {
	description?: string;
	publishedAt?: Date | null;
	publisherVersion?: string;
	runUrl?: string;
	variantList?: { id?: string; language: string; mode: GameVariantMode }[];
}

@Injectable()
export class UpdateAdminGameVersionCommand {

	constructor(
		@InjectRepository(GameVersion)
		private readonly gameVersionRepository: EntityRepository<GameVersion>,
		@InjectRepository(GameVariant)
		private readonly gameVariantRepository: EntityRepository<GameVariant>,
		@InjectRepository(InstitutionGameOffer)
		private readonly institutionGameOfferRepository: EntityRepository<InstitutionGameOffer>,
		@InjectRepository(PublicGameOffer)
		private readonly publicGameOfferRepository: EntityRepository<PublicGameOffer>,
	) {}

	async execute(gameId: string, versionId: string, data: UpdateAdminGameVersionCommandData): Promise<GameVersion> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException('At least one game version field must be provided.');
		}

		const version = await this.gameVersionRepository.findOne({ id: versionId, game: gameId });
		if (!version) {
			throw new NotFoundException('Game version not found for this game.');
		}
		if (version.isPublished()) {
			throw new ConflictException('Published game versions are immutable.');
		}

		const publisherVersion = data.publisherVersion?.trim();
		if (publisherVersion && publisherVersion !== version.publisherVersion) {
			if (await this.gameVersionRepository.findOne({ game: gameId, publisherVersion })) {
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

		if (data.variantList !== undefined) {
			if (data.variantList.length === 0) {
				throw new BadRequestException('At least one game variant is required.');
			}
			const currentVariantList = await this.gameVariantRepository.find({ gameVersion: version.id! });
			const currentVariantById = new Map(currentVariantList.map((variant) => [variant.id!, variant]));
			const requestedIdSet = new Set<string>();
			const requestedPairSet = new Set<string>();
			const entityManager = this.gameVariantRepository.getEntityManager();

			for (const requestedVariant of data.variantList) {
				const language = requestedVariant.language.trim();
				if (!language) {
					throw new BadRequestException('Variant language is required.');
				}
				const pair = `${language}\u0000${requestedVariant.mode}`;
				if (requestedPairSet.has(pair)) {
					throw new ConflictException('Game variants must have unique language and mode pairs.');
				}
				requestedPairSet.add(pair);

				if (requestedVariant.id) {
					const variant = currentVariantById.get(requestedVariant.id);
					if (!variant) {
						throw new NotFoundException('Game variant not found for this version.');
					}
					const conflictingVariant = currentVariantList.find((current) => current.id !== variant.id
						&& current.language === language && current.mode === requestedVariant.mode);
					if (conflictingVariant) {
						throw new ConflictException('A variant with this language and mode already exists.');
					}
					variant.language = language;
					variant.mode = requestedVariant.mode;
					requestedIdSet.add(variant.id!);
				} else {
					const entity = this.gameVariantRepository.create({
						gameVersion: version,
						language,
						mode: requestedVariant.mode,
					});
					entityManager.persist(entity);
				}
			}

			for (const variant of currentVariantList) {
				if (requestedIdSet.has(variant.id!)) {
					continue;
				}
				const [institutionOffer, publicOffer] = await Promise.all([
					this.institutionGameOfferRepository.findOne({ gameVariant: variant.id }),
					this.publicGameOfferRepository.findOne({ gameVariant: variant.id }),
				]);
				if (institutionOffer || publicOffer) {
					throw new ConflictException('Variants referenced by offers cannot be removed.');
				}
				entityManager.remove(variant);
			}
		}

		await this.gameVersionRepository.getEntityManager().flush();
		return version;
	}

}
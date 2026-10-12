import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Currency } from '../../../shared/commerce/model/currency';
import { GameVariant } from '../../game/model/game.variant.entity';
import { PublicGameListing } from '../../game/model/public.game.listing.entity';

interface CreateAdminGameListingCommandDataBase {
	gameId: string;
	gameVariantId: string;
	price: { currency: Currency; minorUnitAmount: number };
}

export interface CreateAdminPublicGameListingCommandData extends CreateAdminGameListingCommandDataBase {
	available: boolean;
	publishedAt?: Date;
}

@Injectable()
export class CreateAdminGameListingCommand {

	constructor(
		@InjectRepository(GameVariant)
		private readonly gameVariantRepository: EntityRepository<GameVariant>,
		@InjectRepository(PublicGameListing)
		private readonly publicGameListingRepository: EntityRepository<PublicGameListing>,
	) {}

	async createPublic(data: CreateAdminPublicGameListingCommandData): Promise<PublicGameListing> {
		const gameVariant = await this.findVariant(data.gameId, data.gameVariantId);
		if (await this.publicGameListingRepository.findOne({ gameVariant: gameVariant.id })) {
			throw new ConflictException('A public listing already exists for this variant.');
		}

		const listing = this.publicGameListingRepository.create({
			gameVariant,
			isAvailable: data.available,
			price: data.price,
			publishedAt: data.publishedAt,
		});
		const entityManager = this.publicGameListingRepository.getEntityManager();
		entityManager.persist(listing);
		await entityManager.flush();
		return listing;
	}

	private async findVariant(gameId: string, gameVariantId: string): Promise<GameVariant> {
		const variant = await this.gameVariantRepository.findOne({
			gameVersion: { game: gameId },
			id: gameVariantId,
		});
		if (!variant) {
			throw new NotFoundException('Game variant not found for this game.');
		}
		return variant;
	}

}
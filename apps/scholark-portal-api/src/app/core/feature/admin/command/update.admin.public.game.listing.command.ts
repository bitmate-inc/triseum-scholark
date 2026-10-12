import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Currency } from '../../../shared/commerce/model/currency';
import { PublicGameListing } from '../../game/model/public.game.listing.entity';

export interface UpdateAdminPublicGameListingCommandData {
	available?: boolean;
	price?: { currency: Currency; minorUnitAmount: number };
	publishedAt?: Date | null;
}

@Injectable()
export class UpdateAdminPublicGameListingCommand {

	constructor(
		@InjectRepository(PublicGameListing)
		private readonly publicGameListingRepository: EntityRepository<PublicGameListing>,
	) {}

	async execute(gameId: string, listingId: string, data: UpdateAdminPublicGameListingCommandData): Promise<PublicGameListing> {
		if (data.available === undefined && data.price === undefined && data.publishedAt === undefined) {
			throw new BadRequestException('At least one public listing field must be provided.');
		}

		const listing = await this.publicGameListingRepository.findOne({
			gameVariant: { gameVersion: { game: gameId } },
			id: listingId,
		});
		if (!listing) {
			throw new NotFoundException('Public game listing not found for this game.');
		}
		if (listing.isPublished()) {
			throw new ConflictException('Published game listings are immutable.');
		}

		if (data.available !== undefined) {
			listing.isAvailable = data.available;
		}
		if (data.price) {
			listing.price = data.price;
		}
		if (Object.prototype.hasOwnProperty.call(data, 'publishedAt')) {
			listing.publishedAt = data.publishedAt ?? undefined;
		}

		const entityManager = this.publicGameListingRepository.getEntityManager();
		await entityManager.flush();
		return listing;
	}

}
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Currency } from '../../../shared/commerce/model/currency';
import { PublicGameOffer } from '../../game/model/public.game.offer.entity';

export interface UpdateAdminPublicGameOfferCommandData {
	available?: boolean;
	price?: { currency: Currency; minorUnitAmount: number };
	publishedAt?: Date | null;
}

@Injectable()
export class UpdateAdminPublicGameOfferCommand {

	constructor(
		@InjectRepository(PublicGameOffer)
		private readonly publicGameOfferRepository: EntityRepository<PublicGameOffer>,
	) {}

	async execute(gameId: string, offerId: string, data: UpdateAdminPublicGameOfferCommandData): Promise<PublicGameOffer> {
		if (data.available === undefined && data.price === undefined && data.publishedAt === undefined) {
			throw new BadRequestException('At least one public offer field must be provided.');
		}

		const offer = await this.publicGameOfferRepository.findOne({
			gameVariant: { gameVersion: { game: gameId } },
			id: offerId,
		});
		if (!offer) {
			throw new NotFoundException('Public game offer not found for this game.');
		}
		if (offer.isPublished()) {
			throw new ConflictException('Published game offers are immutable.');
		}

		if (data.available !== undefined) {
			offer.isAvailable = data.available;
		}
		if (data.price) {
			offer.price = data.price;
		}
		if (Object.prototype.hasOwnProperty.call(data, 'publishedAt')) {
			offer.publishedAt = data.publishedAt ?? undefined;
		}

		const entityManager = this.publicGameOfferRepository.getEntityManager();
		await entityManager.flush();
		return offer;
	}

}
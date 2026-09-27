import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { Currency } from '../../../shared/commerce/model/currency';
import { InstitutionGameOffer, InstitutionGameOfferDesignatedPayor } from '../../education/model/institution.game.offer.entity';

export interface UpdateAdminInstitutionGameOfferCommandData {
	allocatedLicenseQuantity?: number | null;
	designatedPayor?: InstitutionGameOfferDesignatedPayor;
	licenseDurationDays?: number;
	price?: { currency: Currency; minorUnitAmount: number };
	publishedAt?: Date | null;
}

@Injectable()
export class UpdateAdminInstitutionGameOfferCommand {

	constructor(
		@InjectRepository(InstitutionGameOffer)
		private readonly institutionGameOfferRepository: EntityRepository<InstitutionGameOffer>,
	) {}

	async execute(gameId: string, offerId: string, data: UpdateAdminInstitutionGameOfferCommandData): Promise<InstitutionGameOffer> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException('At least one institution offer field must be provided.');
		}

		const offer = await this.institutionGameOfferRepository.findOne({
			gameVariant: { gameVersion: { game: gameId } },
			id: offerId,
		});
		if (!offer) {
			throw new NotFoundException('Institution game offer not found for this game.');
		}
		if (offer.isPublished()) {
			throw new ConflictException('Published game offers are immutable.');
		}

		const designatedPayor = data.designatedPayor ?? offer.designatedPayor;
		if (designatedPayor !== offer.designatedPayor && await this.institutionGameOfferRepository.findOne({
			designatedPayor,
			gameVariant: offer.gameVariant.id,
		})) {
			throw new ConflictException('An offer already exists for this variant and payor.');
		}

		if (data.designatedPayor !== undefined) {
			offer.designatedPayor = data.designatedPayor;
		}
		if (data.price !== undefined) {
			offer.price = data.price;
		}
		if (data.licenseDurationDays !== undefined) {
			offer.licenseDurationDays = data.licenseDurationDays;
		}
		if (Object.prototype.hasOwnProperty.call(data, 'allocatedLicenseQuantity')) {
			offer.allocatedLicenseQuantity = data.allocatedLicenseQuantity ?? undefined;
		}
		if (Object.prototype.hasOwnProperty.call(data, 'publishedAt')) {
			offer.publishedAt = data.publishedAt ?? undefined;
		}

		await this.institutionGameOfferRepository.getEntityManager().flush();
		return offer;
	}

}
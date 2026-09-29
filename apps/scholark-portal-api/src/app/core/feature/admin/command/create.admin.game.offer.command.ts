import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Currency } from '../../../shared/commerce/model/currency';
import { InstitutionGameOffer, InstitutionGameOfferDesignatedPayor } from '../../education/model/institution.game.offer.entity';
import { GameVariant } from '../../game/model/game.variant.entity';
import { PublicGameOffer } from '../../game/model/public.game.offer.entity';

interface CreateAdminGameOfferCommandDataBase {
	gameId: string;
	gameVariantId: string;
	price: { currency: Currency; minorUnitAmount: number };
}

export interface CreateAdminPublicGameOfferCommandData extends CreateAdminGameOfferCommandDataBase {
	available: boolean;
	publishedAt?: Date;
}

export interface CreateAdminInstitutionGameOfferCommandData extends CreateAdminGameOfferCommandDataBase {
	allocatedLicenseQuantity?: number;
	designatedPayor: InstitutionGameOfferDesignatedPayor;
	licenseDurationDays: number;
	publishedAt?: Date;
}

@Injectable()
export class CreateAdminGameOfferCommand {

	constructor(
		@InjectRepository(GameVariant)
		private readonly gameVariantRepository: EntityRepository<GameVariant>,
		@InjectRepository(InstitutionGameOffer)
		private readonly institutionGameOfferRepository: EntityRepository<InstitutionGameOffer>,
		@InjectRepository(PublicGameOffer)
		private readonly publicGameOfferRepository: EntityRepository<PublicGameOffer>,
	) {}

	async createPublic(data: CreateAdminPublicGameOfferCommandData): Promise<PublicGameOffer> {
		const gameVariant = await this.findVariant(data.gameId, data.gameVariantId);
		if (await this.publicGameOfferRepository.findOne({ gameVariant: gameVariant.id })) {
			throw new ConflictException('A public offer already exists for this variant.');
		}

		const offer = this.publicGameOfferRepository.create({
			gameVariant,
			isAvailable: data.available,
			price: data.price,
			publishedAt: data.publishedAt,
		});
		const entityManager = this.publicGameOfferRepository.getEntityManager();
		entityManager.persist(offer);
		await entityManager.flush();
		return offer;
	}

	async createInstitution(data: CreateAdminInstitutionGameOfferCommandData): Promise<InstitutionGameOffer> {
		const gameVariant = await this.findVariant(data.gameId, data.gameVariantId);
		if (await this.institutionGameOfferRepository.findOne({
			designatedPayor: data.designatedPayor,
			gameVariant: gameVariant.id,
		})) {
			throw new ConflictException('An institution offer already exists for this variant and payor.');
		}

		const offer = this.institutionGameOfferRepository.create({
			allocatedLicenseQuantity: data.allocatedLicenseQuantity,
			designatedPayor: data.designatedPayor,
			gameVariant,
			licenseDurationDays: data.licenseDurationDays,
			price: data.price,
			publishedAt: data.publishedAt,
		});
		const entityManager = this.institutionGameOfferRepository.getEntityManager();
		entityManager.persist(offer);
		await entityManager.flush();
		return offer;
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
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Currency } from '../../../shared/commerce/model/currency';
import { Classroom } from '../../education/model/classroom.entity';
import { ClassroomGameListing , ClassroomGameListingDesignatedPayor } from '../../education/model/classroom.game.listing.entity';
import { GameCustomization } from '../../game/model/game.customization.entity';
import { GameVariant } from '../../game/model/game.variant.entity';

export interface CreateAdminClassroomGameListingCommandData {
	classroomId: string;
	designatedPayor: ClassroomGameListingDesignatedPayor;
	endAt: Date;
	gameVariantId: string;
	includedLicenseQuantity?: number;
	licenseDurationDays: number;
	price?: { currency: Currency; minorUnitAmount: number };
	publishedAt?: Date;
	startAt: Date;
	customizationId?: string;
}

@Injectable()
export class CreateAdminClassroomGameListingCommand {

	constructor(
		@InjectRepository(Classroom)
		private readonly classroomRepository: EntityRepository<Classroom>,
		@InjectRepository(ClassroomGameListing)
		private readonly classroomGameListingRepository: EntityRepository<ClassroomGameListing>,
		@InjectRepository(GameVariant)
		private readonly gameVariantRepository: EntityRepository<GameVariant>,
		@InjectRepository(GameCustomization)
		private readonly customizationRepository: EntityRepository<GameCustomization>,
	) {}

	async execute(data: CreateAdminClassroomGameListingCommandData): Promise<ClassroomGameListing> {
		const classroom = await this.classroomRepository.findOne({ id: data.classroomId });
		if (!classroom) {
			throw new NotFoundException('Classroom not found.');
		}

		const gameVariant = await this.gameVariantRepository.findOne({ id: data.gameVariantId });
		if (!gameVariant) {
			throw new NotFoundException('Game variant not found.');
		}
		const customization = data.customizationId
			? await this.customizationRepository.findOne({ id: data.customizationId })
			: undefined;
		if (data.customizationId && !customization) {
			throw new NotFoundException('Game customization not found.');
		}
		if (customization && customization.gameVersion !== gameVariant.gameVersion) {
			throw new BadRequestException('Customization must match the selected game version.');
		}
		if (data.designatedPayor === ClassroomGameListingDesignatedPayor.STUDENT && !data.price) {
			throw new BadRequestException('Student-paid classroom game listings require a price.');
		}
		if (data.designatedPayor === ClassroomGameListingDesignatedPayor.INSTITUTION && data.price) {
			throw new BadRequestException('Institution-funded classroom game listings do not have a student price.');
		}

		if (data.endAt.getTime() <= data.startAt.getTime()) {
			throw new BadRequestException('Listing end date must be after its start date.');
		}

		const classroomGameListing = this.classroomGameListingRepository.create({
			classroom,
			customization,
			designatedPayor: data.designatedPayor,
			endAt: data.endAt,
			gameVariant,
			includedLicenseQuantity: data.includedLicenseQuantity,
			licenseDurationDays: data.licenseDurationDays,
			price: data.price,
			publishedAt: data.publishedAt,
			startAt: data.startAt,
		});
		const entityManager = this.classroomGameListingRepository.getEntityManager();
		entityManager.persist(classroomGameListing);
		await entityManager.flush();
		return classroomGameListing;
	}

}
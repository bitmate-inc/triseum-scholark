import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { Currency } from '../../../shared/commerce/model/currency';
import { Classroom } from '../../education/model/classroom.entity';
import { ClassroomGameListing , ClassroomGameListingDesignatedPayor } from '../../education/model/classroom.game.listing.entity';
import { GameCustomization } from '../../game/model/game.customization.entity';
import { GameVariant } from '../../game/model/game.variant.entity';

export interface UpdateAdminClassroomGameListingCommandData {
	classroomId?: string;
	customizationId?: string | null;
	designatedPayor?: ClassroomGameListingDesignatedPayor;
	endAt?: Date;
	gameVariantId?: string;
	includedLicenseQuantity?: number | null;
	licenseDurationDays?: number;
	price?: { currency: Currency; minorUnitAmount: number } | null;
	publishedAt?: Date | null;
	startAt?: Date;
}

@Injectable()
export class UpdateAdminClassroomGameListingCommand {

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

	async execute(id: string, data: UpdateAdminClassroomGameListingCommandData): Promise<ClassroomGameListing> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException('At least one classroom game listing field must be provided.');
		}
		const classroomGameListing = await this.classroomGameListingRepository.findOne({ id });
		if (!classroomGameListing) {
			throw new NotFoundException('Classroom game listing not found.');
		}
		if (classroomGameListing.isPublished()) {
			throw new ConflictException('Published classroom game listings are immutable. Create a replacement instead.');
		}

		const startAt = data.startAt ?? classroomGameListing.startAt;
		const endAt = data.endAt ?? classroomGameListing.endAt;
		if (endAt.getTime() <= startAt.getTime()) {
			throw new BadRequestException('Listing end date must be after its start date.');
		}
		if (data.classroomId !== undefined) {
			const classroom = await this.classroomRepository.findOne({ id: data.classroomId });
			if (!classroom) {
				throw new NotFoundException('Classroom not found.');
			}
			classroomGameListing.classroom = classroom;
		}
		if (data.gameVariantId !== undefined) {
			const gameVariant = await this.gameVariantRepository.findOne({ id: data.gameVariantId });
			if (!gameVariant) {
				throw new NotFoundException('Game variant not found.');
			}
			classroomGameListing.gameVariant = gameVariant;
		}
		if (Object.prototype.hasOwnProperty.call(data, 'customizationId')) {
			const customization = data.customizationId
				? (await this.customizationRepository.findOne({ id: data.customizationId })) ?? undefined
				: undefined;
			if (data.customizationId && !customization) {
				throw new NotFoundException('Game customization not found.');
			}
			classroomGameListing.customization = customization;
		}
		const designatedPayor = data.designatedPayor ?? classroomGameListing.designatedPayor;
		const price = Object.prototype.hasOwnProperty.call(data, 'price') ? data.price ?? undefined : classroomGameListing.price;
		if (designatedPayor === ClassroomGameListingDesignatedPayor.STUDENT && !price) {
			throw new BadRequestException('Student-paid classroom game listings require a price.');
		}
		if (designatedPayor === ClassroomGameListingDesignatedPayor.INSTITUTION && price) {
			throw new BadRequestException('Institution-funded classroom game listings do not have a student price.');
		}
		classroomGameListing.designatedPayor = designatedPayor;
		classroomGameListing.price = price;
		classroomGameListing.startAt = startAt;
		classroomGameListing.endAt = endAt;
		if (data.licenseDurationDays !== undefined) {
			classroomGameListing.licenseDurationDays = data.licenseDurationDays;
		}
		if (Object.prototype.hasOwnProperty.call(data, 'includedLicenseQuantity')) {
			classroomGameListing.includedLicenseQuantity = data.includedLicenseQuantity ?? undefined;
		}
		if (Object.prototype.hasOwnProperty.call(data, 'publishedAt')) {
			classroomGameListing.publishedAt = data.publishedAt ?? undefined;
		}

		await this.classroomGameListingRepository.getEntityManager().flush();
		return classroomGameListing;
	}

}
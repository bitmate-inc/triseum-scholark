import { LockMode } from '@mikro-orm/core';
import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { MikroOrmUnitOfWork } from '../../../../../lib/database/mikro.orm.unit.of.work';
import { Currency } from '../../../shared/commerce/model/currency';
import { ClassroomGameListing , ClassroomGameListingDesignatedPayor } from '../../education/model/classroom.game.listing.entity';
import { ClassroomGameListingRepository } from '../../education/repository/classroom.game.listing.repository';
import { ClassroomRepository } from '../../education/repository/classroom.repository';
import { listingWindowsOverlap } from '../../game/model/listing.window.util';
import { GameCustomizationRepository } from '../../game/repository/game.customization.repository';
import { GameVersionRepository } from '../../game/repository/game.version.repository';

export interface CreateAdminClassroomGameListingCommandData {
	classroomId: string;
	designatedPayor: ClassroomGameListingDesignatedPayor;
	endAt: Date;
	gameVersionId: string;
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
		private readonly classroomRepository: ClassroomRepository,
		private readonly gameVersionRepository: GameVersionRepository,
		private readonly gameCustomizationRepository: GameCustomizationRepository,
		private readonly classroomGameListingRepository: ClassroomGameListingRepository,
		private readonly unitOfWork: MikroOrmUnitOfWork,
	) {}

	async execute(data: CreateAdminClassroomGameListingCommandData): Promise<ClassroomGameListing> {
		return this.unitOfWork.transactional(async () => {
			const classroom = await this.classroomRepository.findOneBy({ id: data.classroomId }, { lockMode: LockMode.PESSIMISTIC_WRITE });
			if (!classroom) {
				throw new NotFoundException('Classroom not found.');
			}

			const gameVersion = await this.gameVersionRepository.findOneBy({ id: data.gameVersionId });
			if (!gameVersion) {
				throw new NotFoundException('Game version not found.');
			}
			const customization = data.customizationId
				? await this.gameCustomizationRepository.findOneBy({ id: data.customizationId })
				: undefined;
			if (data.customizationId && !customization) {
				throw new NotFoundException('Game customization not found.');
			}
			if (customization && customization.gameVersion.id !== gameVersion.id) {
				throw new BadRequestException('Customization must match the selected game version.');
			}
			if (customization && data.publishedAt && !customization.isPublished(data.publishedAt)) {
				throw new BadRequestException('Customization must be published before the listing.');
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

			const existingListingList = await this.classroomGameListingRepository.findByClassroomAndGameVersion(classroom.id!, gameVersion.id!);
			if (existingListingList.some((listing) => listingWindowsOverlap(listing.startAt, listing.endAt, data.startAt, data.endAt))) {
				throw new BadRequestException('Classroom game listing windows may not overlap for the same game version.');
			}

			const classroomGameListing = this.classroomGameListingRepository.create({
				classroom,
				courseType: classroom.courseType,
				customization,
				designatedPayor: data.designatedPayor,
				endAt: data.endAt,
				gameVersion,
				includedLicenseQuantity: data.includedLicenseQuantity,
				language: classroom.language,
				licenseDurationDays: data.licenseDurationDays,
				price: data.price,
				publishedAt: data.publishedAt,
				startAt: data.startAt,
			});
			await this.classroomGameListingRepository.save(classroomGameListing);
			return classroomGameListing;
		});
	}

}
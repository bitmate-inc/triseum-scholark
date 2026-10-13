import { LockMode } from '@mikro-orm/core';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { MikroOrmUnitOfWork } from '../../../../../lib/database/mikro.orm.unit.of.work';
import { Currency } from '../../../shared/commerce/model/currency';
import { Classroom } from '../../education/model/classroom.entity';
import { ClassroomGameListing , ClassroomGameListingDesignatedPayor } from '../../education/model/classroom.game.listing.entity';
import { ClassroomGameListingRepository } from '../../education/repository/classroom.game.listing.repository';
import { ClassroomRepository } from '../../education/repository/classroom.repository';
import { listingWindowsOverlap } from '../../game/model/listing.window.util';
import { GameCustomizationRepository } from '../../game/repository/game.customization.repository';
import { GameVersionRepository } from '../../game/repository/game.version.repository';

export interface UpdateAdminClassroomGameListingCommandData {
	classroomId?: string;
	customizationId?: string | null;
	designatedPayor?: ClassroomGameListingDesignatedPayor;
	endAt?: Date;
	gameVersionId?: string;
	includedLicenseQuantity?: number | null;
	licenseDurationDays?: number;
	price?: { currency: Currency; minorUnitAmount: number } | null;
	publishedAt?: Date | null;
	startAt?: Date;
}

@Injectable()
export class UpdateAdminClassroomGameListingCommand {

	constructor(
		private readonly classroomGameListingRepository: ClassroomGameListingRepository,
		private readonly classroomRepository: ClassroomRepository,
		private readonly gameVersionRepository: GameVersionRepository,
		private readonly gameCustomizationRepository: GameCustomizationRepository,
		private readonly unitOfWork: MikroOrmUnitOfWork,
	) {}

	async execute(id: string, data: UpdateAdminClassroomGameListingCommandData): Promise<ClassroomGameListing> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException('At least one classroom game listing field must be provided.');
		}
		return this.unitOfWork.transactional(async () => {
			const classroomGameListing = await this.classroomGameListingRepository.findOneBy({ id }, {
				lockMode: LockMode.PESSIMISTIC_WRITE,
				relations: { classroom: true, gameVersion: true, customization: true },
			});
			if (!classroomGameListing) {
				throw new NotFoundException('Classroom game listing not found.');
			}
			if (classroomGameListing.isPublished()) {
				throw new ConflictException('Published classroom game listings are immutable. Create a replacement instead.');
			}

			const classroomIdList = [classroomGameListing.classroom.id!, data.classroomId ?? classroomGameListing.classroom.id!]
				.filter((classroomId, index, list) => list.indexOf(classroomId) === index)
				.sort();
			const lockedClassroomById = new Map<string, Classroom>();
			for (const classroomId of classroomIdList) {
				const classroom = await this.classroomRepository.findOneBy({ id: classroomId }, { lockMode: LockMode.PESSIMISTIC_WRITE });
				if (!classroom) {
					throw new NotFoundException('Classroom not found.');
				}
				lockedClassroomById.set(classroomId, classroom);
			}

			const classroom = lockedClassroomById.get(data.classroomId ?? classroomGameListing.classroom.id!)!;
			const gameVersion = data.gameVersionId
				? await this.gameVersionRepository.findOneBy({ id: data.gameVersionId })
				: classroomGameListing.gameVersion;
			if (!gameVersion) {
				throw new NotFoundException('Game version not found.');
			}
			const customization = Object.prototype.hasOwnProperty.call(data, 'customizationId')
				? data.customizationId
					? (await this.gameCustomizationRepository.findOneBy({ id: data.customizationId })) ?? undefined
					: undefined
				: classroomGameListing.customization;
			if (data.customizationId && !customization) {
				throw new NotFoundException('Game customization not found.');
			}
			if (customization && customization.gameVersion.id !== gameVersion.id) {
				throw new BadRequestException('Customization must match the selected game version.');
			}
			const listingPublicationDate = Object.prototype.hasOwnProperty.call(data, 'publishedAt')
				? data.publishedAt ?? undefined
				: classroomGameListing.publishedAt;
			if (customization && listingPublicationDate && !customization.isPublished(listingPublicationDate)) {
				throw new BadRequestException('Customization must be published before the listing.');
			}

			const startAt = data.startAt ?? classroomGameListing.startAt;
			const endAt = data.endAt ?? classroomGameListing.endAt;
			if (endAt.getTime() <= startAt.getTime()) {
				throw new BadRequestException('Listing end date must be after its start date.');
			}
			const existingListingList = await this.classroomGameListingRepository.findByClassroomAndGameVersion(
				classroom.id!,
				gameVersion.id!,
				classroomGameListing.id,
			);
			if (existingListingList.some((listing) => listingWindowsOverlap(listing.startAt, listing.endAt, startAt, endAt))) {
				throw new ConflictException('Classroom game listing windows may not overlap for the same game version.');
			}

			const designatedPayor = data.designatedPayor ?? classroomGameListing.designatedPayor;
			const price = Object.prototype.hasOwnProperty.call(data, 'price') ? data.price ?? undefined : classroomGameListing.price;
			if (designatedPayor === ClassroomGameListingDesignatedPayor.STUDENT && !price) {
				throw new BadRequestException('Student-paid classroom game listings require a price.');
			}
			if (designatedPayor === ClassroomGameListingDesignatedPayor.INSTITUTION && price) {
				throw new BadRequestException('Institution-funded classroom game listings do not have a student price.');
			}

			classroomGameListing.classroom = classroom;
			classroomGameListing.gameVersion = gameVersion;
			if (data.classroomId !== undefined) {
				classroomGameListing.language = classroom.language;
				classroomGameListing.courseType = classroom.courseType;
			}
			classroomGameListing.customization = customization;
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

			await this.classroomGameListingRepository.save(classroomGameListing);
			return classroomGameListing;
		});
	}

}
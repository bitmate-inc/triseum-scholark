import { LockMode } from '@mikro-orm/core';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { MikroOrmUnitOfWork } from '../../../../../lib/database/mikro.orm.unit.of.work';
import { listingWindowsOverlap } from '../../game/model/listing.window.util';
import { PublicGameListing } from '../../game/model/public.game.listing.entity';
import { normalizePublicGameListingPriceGroupInputList, type PublicGameListingPriceGroupInput } from '../../game/model/public.game.listing.price.group.util';
import { GameVersionRepository } from '../../game/repository/game.version.repository';
import { PublicGameListingPriceGroupLanguageRepository } from '../../game/repository/public.game.listing.price.group.language.repository';
import { PublicGameListingPriceGroupRepository } from '../../game/repository/public.game.listing.price.group.repository';
import { PublicGameListingRepository } from '../../game/repository/public.game.listing.repository';

export interface UpdateAdminPublicGameListingCommandData {
	available?: boolean;
	priceGroupList?: PublicGameListingPriceGroupInput[];
	startAt?: Date;
	endAt?: Date | null;
	publishedAt?: Date | null;
}

@Injectable()
export class UpdateAdminPublicGameListingCommand {

	constructor(
		private readonly publicGameListingRepository: PublicGameListingRepository,
		private readonly gameVersionRepository: GameVersionRepository,
		private readonly priceGroupRepository: PublicGameListingPriceGroupRepository,
		private readonly priceGroupLanguageRepository: PublicGameListingPriceGroupLanguageRepository,
		private readonly unitOfWork: MikroOrmUnitOfWork,
	) {}

	async execute(gameId: string, listingId: string, data: UpdateAdminPublicGameListingCommandData): Promise<PublicGameListing> {
		if (data.available === undefined && data.priceGroupList === undefined && data.startAt === undefined && data.endAt === undefined && data.publishedAt === undefined) {
			throw new BadRequestException('At least one public listing field must be provided.');
		}

		return this.unitOfWork.transactional(async () => {
			const listing = await this.publicGameListingRepository.findForAdminUpdate(gameId, listingId);
			if (!listing) {
				throw new NotFoundException('Public game listing not found for this game.');
			}

			const isPublished = listing.isPublished();
			if (isPublished) {
				if (!(data.endAt instanceof Date)
					|| data.available !== undefined
					|| data.priceGroupList !== undefined
					|| data.startAt !== undefined
					|| data.publishedAt !== undefined) {
					throw new ConflictException('Published game listing terms are immutable; only its end date can be set.');
				}
				if (data.endAt <= listing.startAt! || (listing.endAt && data.endAt >= listing.endAt)) {
					throw new BadRequestException('Closing date must fall after listing start and before its current end date.');
				}
			}

			const startAt = data.startAt ?? listing.startAt!;
			const endAt = data.endAt === undefined ? listing.endAt : data.endAt ?? undefined;
			if (endAt && endAt <= startAt) {
				throw new BadRequestException('Listing end date must be after its start date.');
			}

			await this.gameVersionRepository.findOneBy({ id: listing.gameVersion.id }, { lockMode: LockMode.PESSIMISTIC_WRITE });
			const existingListingList = await this.publicGameListingRepository.findByGameVersion(listing.gameVersion.id!, listing.id);
			if (existingListingList.some((otherListing) => listingWindowsOverlap(otherListing.startAt!, otherListing.endAt, startAt, endAt))) {
				throw new ConflictException('Public game listing windows may not overlap for the same game version.');
			}

			if (data.available !== undefined) {
				listing.isAvailable = data.available;
			}
			if (!isPublished) {
				if (data.startAt !== undefined) {
					listing.startAt = data.startAt;
				}
				listing.endAt = endAt;
				if (data.priceGroupList !== undefined) {
					const priceGroupInputList = normalizePublicGameListingPriceGroupInputList(data.priceGroupList);
					listing.priceGroupList.removeAll();
					for (const priceGroupInput of priceGroupInputList) {
						const priceGroup = this.priceGroupRepository.create({
							price: priceGroupInput.price,
							publicGameListing: listing,
						});
						for (const language of priceGroupInput.languageList) {
							priceGroup.languageList.add(this.priceGroupLanguageRepository.create({
								language,
								priceGroup,
								publicGameListing: listing,
							}));
						}
						listing.priceGroupList.add(priceGroup);
					}
				}
				if (Object.prototype.hasOwnProperty.call(data, 'publishedAt')) {
					listing.publishedAt = data.publishedAt ?? undefined;
				}
			} else {
				listing.endAt = endAt;
			}

			await this.publicGameListingRepository.save(listing);
			return listing;
		});
	}

}
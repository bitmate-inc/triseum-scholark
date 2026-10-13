import { LockMode } from '@mikro-orm/postgresql';
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

interface CreateAdminGameListingCommandDataBase {
	gameId: string;
	gameVersionId: string;
	priceGroupList: PublicGameListingPriceGroupInput[];
}

export interface CreateAdminPublicGameListingCommandData extends CreateAdminGameListingCommandDataBase {
	available: boolean;
	startAt?: Date;
	endAt?: Date;
	publishedAt?: Date;
}

@Injectable()
export class CreateAdminGameListingCommand {

	constructor(
		private readonly gameVersionRepository: GameVersionRepository,
		private readonly publicGameListingRepository: PublicGameListingRepository,
		private readonly priceGroupRepository: PublicGameListingPriceGroupRepository,
		private readonly priceGroupLanguageRepository: PublicGameListingPriceGroupLanguageRepository,
		private readonly unitOfWork: MikroOrmUnitOfWork,
	) {}

	async createPublic(data: CreateAdminPublicGameListingCommandData): Promise<PublicGameListing> {
		return this.unitOfWork.transactional(async () => {
			const gameVersion = await this.gameVersionRepository.findOneBy({
				game: data.gameId,
				id: data.gameVersionId,
			}, { lockMode: LockMode.PESSIMISTIC_WRITE });
			if (!gameVersion) {
				throw new NotFoundException('Game version not found for this game.');
			}

			const startAt = data.startAt ?? new Date();
			if (data.endAt && data.endAt <= startAt) {
				throw new BadRequestException('Listing end date must be after its start date.');
			}

			const existingListingList = await this.publicGameListingRepository.findByGameVersion(gameVersion.id!);
			if (existingListingList.some((listing) => listingWindowsOverlap(listing.startAt!, listing.endAt, startAt, data.endAt))) {
				throw new ConflictException('Public game listing windows may not overlap for the same game version.');
			}

			const priceGroupInputList = normalizePublicGameListingPriceGroupInputList(data.priceGroupList);
			const listing = this.publicGameListingRepository.create({
				endAt: data.endAt,
				gameVersion,
				isAvailable: data.available,
				publishedAt: data.publishedAt,
				startAt,
			});

			for (const priceGroupInput of priceGroupInputList) {
				const priceGroup = this.priceGroupRepository.create({
					price: priceGroupInput.price,
					publicGameListing: listing,
				});
				listing.priceGroupList.add(priceGroup);
				for (const language of priceGroupInput.languageList) {
					priceGroup.languageList.add(this.priceGroupLanguageRepository.create({
						language,
						priceGroup,
						publicGameListing: listing,
					}));
				}
			}

			await this.publicGameListingRepository.save(listing);
			return listing;
		});
	}

}
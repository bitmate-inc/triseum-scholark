import { EntityRepository, LockMode } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { PublicGameListing } from '../model/public.game.listing.entity';

@Injectable()
export class PublicGameListingRepository extends MikroOrmEntityRepository<PublicGameListing> {

	constructor(
		@InjectRepository(PublicGameListing) repository: EntityRepository<PublicGameListing>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(PublicGameListing, repository, transactionContext);
	}

	findByGameVersion(gameVersionId: string, excludingListingId?: string): Promise<PublicGameListing[]> {
		const where = excludingListingId
			? { gameVersion: gameVersionId, id: { $ne: excludingListingId } }
			: { gameVersion: gameVersionId };
		return this.repository.find(where);
	}

	async findForAdminUpdate(gameId: string, listingId: string): Promise<PublicGameListing | undefined> {
		return (await this.repository.findOne(
			{ id: listingId, gameVersion: { game: gameId } },
			{
				lockMode: LockMode.PESSIMISTIC_WRITE,
				populate: ['priceGroupList.languageList'],
			},
		)) ?? undefined;
	}

	async findForAcquisition(id: string): Promise<PublicGameListing | undefined> {
		return (await this.repository.findOne(
			{
				id,
				isAvailable: true,
			},
			{
				populate: ['gameVersion.game', 'priceGroupList', 'priceGroupList.languageList'],
			},
		)) ?? undefined;
	}

}

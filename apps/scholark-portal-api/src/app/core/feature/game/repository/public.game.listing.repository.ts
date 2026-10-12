import { EntityRepository } from '@mikro-orm/core';
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

	async findForAcquisition(id: string): Promise<PublicGameListing | undefined> {
		return (await this.repository.findOne(
			{
				id,
				isAvailable: true,
			},
			{
				populate: ['gameVariant.gameVersion.game'],
			},
		)) ?? undefined;
	}

}

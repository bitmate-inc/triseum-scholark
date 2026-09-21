import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { PublicGameOffer } from '../model/public.game.offer.entity';

@Injectable()
export class PublicGameOfferRepository extends MikroOrmEntityRepository<PublicGameOffer> {

	constructor(
		@InjectRepository(PublicGameOffer) repository: EntityRepository<PublicGameOffer>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(PublicGameOffer, repository, transactionContext);
	}

	async findForAcquisition(id: string): Promise<PublicGameOffer | undefined> {
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

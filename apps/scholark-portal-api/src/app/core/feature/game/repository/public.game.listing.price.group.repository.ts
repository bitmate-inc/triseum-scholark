import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { PublicGameListingPriceGroup } from '../model/public.game.listing.price.group.entity';

@Injectable()
export class PublicGameListingPriceGroupRepository extends MikroOrmEntityRepository<PublicGameListingPriceGroup> {

	constructor(
		@InjectRepository(PublicGameListingPriceGroup) repository: EntityRepository<PublicGameListingPriceGroup>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(PublicGameListingPriceGroup, repository, transactionContext);
	}

}
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { PublicGameListingPriceGroupLanguage } from '../model/public.game.listing.price.group.language.entity';

@Injectable()
export class PublicGameListingPriceGroupLanguageRepository extends MikroOrmEntityRepository<PublicGameListingPriceGroupLanguage> {

	constructor(
		@InjectRepository(PublicGameListingPriceGroupLanguage) repository: EntityRepository<PublicGameListingPriceGroupLanguage>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(PublicGameListingPriceGroupLanguage, repository, transactionContext);
	}

}
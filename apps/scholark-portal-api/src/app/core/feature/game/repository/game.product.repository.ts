import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { GameProduct } from '../model/game.product.entity';

@Injectable()
export class GameProductRepository extends MikroOrmEntityRepository<GameProduct> {

	constructor(
		@InjectRepository(GameProduct) repository: EntityRepository<GameProduct>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(GameProduct, repository, transactionContext);
	}

	async findForAcquisition(id: string): Promise<GameProduct | undefined> {
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

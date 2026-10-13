import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { GameCustomization } from '../model/game.customization.entity';

@Injectable()
export class GameCustomizationRepository extends MikroOrmEntityRepository<GameCustomization> {

	constructor(
		@InjectRepository(GameCustomization) repository: EntityRepository<GameCustomization>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(GameCustomization, repository, transactionContext);
	}

}
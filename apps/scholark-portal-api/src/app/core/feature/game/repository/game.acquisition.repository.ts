import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { GameAcquisition } from '../model/game.acquisition.entity';

@Injectable()
export class GameAcquisitionRepository extends MikroOrmEntityRepository<GameAcquisition> {

	constructor(
		@InjectRepository(GameAcquisition) repository: EntityRepository<GameAcquisition>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(GameAcquisition, repository, transactionContext);
	}

}

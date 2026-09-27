import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { GameAcquisitionEvent } from '../model/game.acquisition.event.entity';

@Injectable()
export class GameAcquisitionEventRepository extends MikroOrmEntityRepository<GameAcquisitionEvent> {

	constructor(
		@InjectRepository(GameAcquisitionEvent) repository: EntityRepository<GameAcquisitionEvent>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(GameAcquisitionEvent, repository, transactionContext);
	}

}
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { Game } from '../model/game.entity';

@Injectable()
export class GameRepository extends MikroOrmEntityRepository<Game> {

	constructor(
		@InjectRepository(Game) repository: EntityRepository<Game>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(Game, repository, transactionContext);
	}

}
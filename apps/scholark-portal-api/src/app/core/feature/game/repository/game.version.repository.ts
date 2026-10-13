import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { GameVersion } from '../model/game.version.entity';

@Injectable()
export class GameVersionRepository extends MikroOrmEntityRepository<GameVersion> {

	constructor(
		@InjectRepository(GameVersion) repository: EntityRepository<GameVersion>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(GameVersion, repository, transactionContext);
	}

}
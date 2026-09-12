import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { Game } from '../model/game.entity';
import { GameLicense } from '../model/game.license.entity';

@Injectable()
export class GameLicenseRepository extends MikroOrmEntityRepository<GameLicense> {

	constructor(
		@InjectRepository(GameLicense) repository: EntityRepository<GameLicense>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(GameLicense, repository, transactionContext);
	}

	async findActiveByUserAndGame(userId: string, game: Game): Promise<GameLicense | undefined> {
		const now = new Date();
		return (await this.repository.findOne(
			{
				endAt: { $gte: now },
				gameVersion: { game },
				startAt: { $lte: now },
				user: userId,
			},
			{ orderBy: { endAt: 'desc' } },
		)) ?? undefined;
	}

}

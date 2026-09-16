import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { FindOptions } from '../../../../../lib/entity/repository/entity.repository.interface';
import { Game } from '../model/game.entity';
import { GameVersion } from '../model/game.version.entity';

@Injectable()
export class GameVersionRepository extends MikroOrmEntityRepository<GameVersion> {

	constructor(
		@InjectRepository(GameVersion) repository: EntityRepository<GameVersion>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(GameVersion, repository, transactionContext);
	}

	async findLatestPublishedByGame(game: Game, options?: FindOptions<GameVersion>): Promise<GameVersion | undefined> {
		return (await this.repository.findOne(
			{ game, publishedAt: { $lte: new Date() } },
			{ 
				orderBy: { publishedAt: 'desc' },
				populate: this.toPopulate(options?.relations) as never,
				filters: options?.withDeleted ? { softDelete: false } : {},
			},
		)) ?? undefined;
	}	

	async findForAcquisition(id: string, options?: FindOptions<GameVersion>): Promise<GameVersion | undefined> {
		return this.findOneBy(
			{ id, publishedAt: { $lte: new Date() } },
			{
				relations: {
					...(options?.relations ?? {}),
					game: true,
				},
			}
		);
	}

}

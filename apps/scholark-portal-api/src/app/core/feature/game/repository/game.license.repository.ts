import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { Game } from '../model/game.entity';
import { GameLicense } from '../model/game.license.entity';
import { GameVariant } from '../model/game.variant.entity';

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
				endAt: { $gt: now },
				gameVariant: { gameVersion: { game } },
				startAt: { $lte: now },
				user: userId,
			},
			{ orderBy: { endAt: 'desc' } },
		)) ?? undefined;
	}

	async findActiveByUserAndGameVariant(userId: string, gameVariant: GameVariant): Promise<GameLicense | undefined> {
		const now = new Date();
		return (await this.repository.findOne(
			{
				endAt: { $gt: now },
				gameVariant,
				startAt: { $lte: now },
				user: userId,
			},
			{ orderBy: { endAt: 'desc' } },
		)) ?? undefined;
	}

	async findByUserAndClassroomGame(userId: string, classroomGameId: string): Promise<GameLicense | undefined> {
		const now = new Date();
		return (await this.repository.findOne({
			classroomGame: classroomGameId,
			endAt: { $gt: now },
			startAt: { $lte: now },
			user: userId,
		})) ?? undefined;
	}

}

import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { GameLicense } from '../model/game.license.entity';
import { GameVersion } from '../model/game.version.entity';

@Injectable()
export class GameLicenseRepository extends MikroOrmEntityRepository<GameLicense> {

	constructor(
		@InjectRepository(GameLicense) repository: EntityRepository<GameLicense>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(GameLicense, repository, transactionContext);
	}

	async findActiveByUserAndConfiguration(
		userId: string,
		gameVersion: GameVersion,
		language: string,
		courseType: GameLicense['courseType'],
	): Promise<GameLicense | undefined> {
		const now = new Date();
		return (await this.repository.findOne(
			{
				endAt: { $gt: now },
				gameVersion,
				language,
				courseType,
				startAt: { $lte: now },
				user: userId,
			},
			{ orderBy: { endAt: 'desc' } },
		)) ?? undefined;
	}

	async findByUserAndClassroomGameListing(userId: string, classroomGameListingId: string): Promise<GameLicense | undefined> {
		const now = new Date();
		return (await this.repository.findOne({
			classroomGameListing: classroomGameListingId,
			endAt: { $gt: now },
			startAt: { $lte: now },
			user: userId,
		})) ?? undefined;
	}

	findOwnedById(userId: string, licenseId: string): Promise<GameLicense | undefined> {
		return this.findOneBy(
			{ id: licenseId, user: userId },
			{
				relations: {
					gameVersion: { game: true },
					customization: true,
					classroomGameListing: true,
				},
			},
		);
	}

}

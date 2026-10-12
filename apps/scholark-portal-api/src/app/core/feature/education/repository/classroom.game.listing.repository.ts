import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { ClassroomGameListing } from '../model/classroom.game.listing.entity';

@Injectable()
export class ClassroomGameListingRepository extends MikroOrmEntityRepository<ClassroomGameListing> {

	constructor(
		@InjectRepository(ClassroomGameListing) repository: EntityRepository<ClassroomGameListing>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(ClassroomGameListing, repository, transactionContext);
	}

	async findForAcquisition(id: string): Promise<ClassroomGameListing | undefined> {
		return (await this.repository.findOne(
			{ id, publishedAt: { $lte: new Date() } },
			{
				populate: [
					'classroom.institution',
					'customization',
					'gameVariant.gameVersion.game',
					'gameVariant.gameVersion.game.publisher',
					'gameVariant.gameVersion.game.taxonomyList.taxonomyTerm',
				] as never,
			},
		)) ?? undefined;
	}

}
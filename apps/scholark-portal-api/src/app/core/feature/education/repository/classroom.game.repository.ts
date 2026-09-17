import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { ClassroomGame } from '../model/classroom.game.entity';

@Injectable()
export class ClassroomGameRepository extends MikroOrmEntityRepository<ClassroomGame> {

	constructor(
		@InjectRepository(ClassroomGame) repository: EntityRepository<ClassroomGame>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(ClassroomGame, repository, transactionContext);
	}

	async findForAcquisition(id: string): Promise<ClassroomGame | undefined> {
		return (await this.repository.findOne(
			{ id, publishedAt: { $lte: new Date() } },
			{
				populate: [
					'classroom.institution',
					'customization',
					'contractGameVersion.gameVersion.game',
					'contractGameVersion.gameVersion.game.publisherList',
					'contractGameVersion.gameVersion.game.taxonomyList.taxonomyTerm',
				] as never,
			},
		)) ?? undefined;
	}

}
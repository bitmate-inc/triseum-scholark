import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { Game } from '../../game/model/game.entity';
import { ContractGame } from '../model/contract.game.entity';
import { EducationalInstitution } from '../model/educational.institution.entity';
import { InstitutionContractDesignatedPayor, InstitutionContractStatus } from '../model/institution.contract.entity';

@Injectable()
export class ContractGameRepository extends MikroOrmEntityRepository<ContractGame> {

	constructor(
		@InjectRepository(ContractGame) repository: EntityRepository<ContractGame>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(ContractGame, repository, transactionContext);
	}

	async findActiveStudentPayorByInstitutionAndGame(
		institution: EducationalInstitution,
		game: Game,
	): Promise<ContractGame | undefined> {
		const now = new Date();
		return (await this.repository.findOne({
			contract: {
				designatedPayor: InstitutionContractDesignatedPayor.STUDENT,
				endAt: { $gte: now },
				institution,
				startAt: { $lte: now },
				status: InstitutionContractStatus.ACTIVE,
			},
			game,
		})) ?? undefined;
	}

}
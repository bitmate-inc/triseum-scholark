import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { InstitutionContractDesignatedPayor, InstitutionContractStatus } from '../model/institution.contract.entity';
import { InstitutionContractGameOffer } from '../model/institution.contract.game.offer.entity';
import { Institution } from '../model/institution.entity';

@Injectable()
export class InstitutionContractGameOfferRepository extends MikroOrmEntityRepository<InstitutionContractGameOffer> {

	constructor(
		@InjectRepository(InstitutionContractGameOffer) repository: EntityRepository<InstitutionContractGameOffer>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(InstitutionContractGameOffer, repository, transactionContext);
	}

	async findActiveStudentPayorByInstitutionAndGameOffer(
		institution: Institution,
		contractGameOffer: InstitutionContractGameOffer,
	): Promise<InstitutionContractGameOffer | undefined> {
		const now = new Date();
		return (await this.repository.findOne({
			id: contractGameOffer.id,
			contract: {
				designatedPayor: InstitutionContractDesignatedPayor.STUDENT,
				endAt: { $gte: now },
				institution,
				startAt: { $lte: now },
				status: InstitutionContractStatus.ACTIVE,
			},
		})) ?? undefined;
	}

}
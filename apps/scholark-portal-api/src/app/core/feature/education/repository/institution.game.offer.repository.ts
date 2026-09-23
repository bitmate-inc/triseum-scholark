import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { InstitutionGameOffer, InstitutionGameOfferDesignatedPayor } from '../model/institution.game.offer.entity';

@Injectable()
export class InstitutionGameOfferRepository extends MikroOrmEntityRepository<InstitutionGameOffer> {

	constructor(
		@InjectRepository(InstitutionGameOffer) repository: EntityRepository<InstitutionGameOffer>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(InstitutionGameOffer, repository, transactionContext);
	}

	async findStudentPayorOffer(institutionGameOffer: InstitutionGameOffer): Promise<InstitutionGameOffer | undefined> {
		return (await this.repository.findOne({
			id: institutionGameOffer.id,
			designatedPayor: InstitutionGameOfferDesignatedPayor.STUDENT,
		})) ?? undefined;
	}

}
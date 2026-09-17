import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { InstitutionContractDesignatedPayor, InstitutionContractStatus } from '../model/institution.contract.entity';
import { InstitutionContractGameProduct } from '../model/institution.contract.game.version.entity';
import { Institution } from '../model/institution.entity';

@Injectable()
export class InstitutionContractGameProductRepository extends MikroOrmEntityRepository<InstitutionContractGameProduct> {

	constructor(
		@InjectRepository(InstitutionContractGameProduct) repository: EntityRepository<InstitutionContractGameProduct>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(InstitutionContractGameProduct, repository, transactionContext);
	}

	async findActiveStudentPayorByInstitutionAndGameProduct(
		institution: Institution,
		contractGameProduct: InstitutionContractGameProduct,
	): Promise<InstitutionContractGameProduct | undefined> {
		const now = new Date();
		return (await this.repository.findOne({
			id: contractGameProduct.id,
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
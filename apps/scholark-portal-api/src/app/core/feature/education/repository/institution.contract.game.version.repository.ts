import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { InstitutionContractDesignatedPayor, InstitutionContractStatus } from '../model/institution.contract.entity';
import { InstitutionContractGameVersion } from '../model/institution.contract.game.version.entity';
import { Institution } from '../model/institution.entity';

@Injectable()
export class InstitutionContractGameVersionRepository extends MikroOrmEntityRepository<InstitutionContractGameVersion> {

	constructor(
		@InjectRepository(InstitutionContractGameVersion) repository: EntityRepository<InstitutionContractGameVersion>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(InstitutionContractGameVersion, repository, transactionContext);
	}

	async findActiveStudentPayorByInstitutionAndGameVersion(
		institution: Institution,
		contractGameVersion: InstitutionContractGameVersion,
	): Promise<InstitutionContractGameVersion | undefined> {
		const now = new Date();
		return (await this.repository.findOne({
			id: contractGameVersion.id,
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
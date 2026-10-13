import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { Institution } from '../model/institution.entity';

@Injectable()
export class InstitutionRepository extends MikroOrmEntityRepository<Institution> {

	constructor(
		@InjectRepository(Institution) repository: EntityRepository<Institution>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(Institution, repository, transactionContext);
	}

}
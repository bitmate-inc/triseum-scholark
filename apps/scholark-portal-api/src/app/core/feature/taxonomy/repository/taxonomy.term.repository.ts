import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { TaxonomyTerm } from '../model/taxonomy.term.entity';

@Injectable()
export class TaxonomyTermRepository extends MikroOrmEntityRepository<TaxonomyTerm> {

	constructor(
		@InjectRepository(TaxonomyTerm) repository: EntityRepository<TaxonomyTerm>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(TaxonomyTerm, repository, transactionContext);
	}

}
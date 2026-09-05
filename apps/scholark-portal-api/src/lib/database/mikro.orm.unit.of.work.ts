import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { EntityUnitOfWorkInterface } from '../entity/unit-of-work/entity.unit.of.work.interface';
import { MikroOrmTransactionContext } from './mikro.orm.transaction.context';

@Injectable()
export class MikroOrmUnitOfWork implements EntityUnitOfWorkInterface {

	constructor(
		private readonly entityManager: EntityManager,
		private readonly transactionContext: MikroOrmTransactionContext,
	) {}

	transactional<Result>(work: () => Promise<Result>): Promise<Result> {
		return this.entityManager.transactional((transactionalEntityManager) =>
			this.transactionContext.run(transactionalEntityManager, work),
		);
	}

}

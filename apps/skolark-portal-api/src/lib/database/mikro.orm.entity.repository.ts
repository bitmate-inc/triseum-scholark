import { EntityName, EntityRepository } from '@mikro-orm/core';

import { MikroOrmTransactionContext } from './mikro.orm.transaction.context';

export abstract class MikroOrmEntityRepository<Entity extends object> {

	protected constructor(
		private readonly entityName: EntityName<Entity>,
		private readonly defaultRepository: EntityRepository<Entity>,
		private readonly transactionContext: MikroOrmTransactionContext,
	) {}

	protected get repository(): EntityRepository<Entity> {
		const entityManager = this.transactionContext.getEntityManager();

		if (!entityManager) {
			return this.defaultRepository;
		}

		return entityManager.getRepository(this.entityName);
	}

}

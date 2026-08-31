import { AsyncLocalStorage } from 'node:async_hooks';

import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MikroOrmTransactionContext {

	private readonly storage = new AsyncLocalStorage<EntityManager>();

	run<Result>(
		entityManager: EntityManager,
		work: () => Promise<Result>,
	): Promise<Result> {
		return this.storage.run(entityManager, work);
	}

	getEntityManager(): EntityManager | undefined {
		return this.storage.getStore();
	}

}

import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { Publisher } from '../model/publisher.entity';

@Injectable()
export class PublisherRepository extends MikroOrmEntityRepository<Publisher> {

	constructor(
		@InjectRepository(Publisher) repository: EntityRepository<Publisher>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(Publisher, repository, transactionContext);
	}

}
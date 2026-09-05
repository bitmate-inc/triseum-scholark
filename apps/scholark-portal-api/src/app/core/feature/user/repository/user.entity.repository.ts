import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { FindOneQuery, FindOptions } from '../../../../../lib/entity/repository/entity.repository.interface';
import { User , UserStatus } from '../model/user.entity';

export interface FindOneUserQuery extends FindOneQuery {
	email?: string;
}

@Injectable()
export class UserEntityRepository extends MikroOrmEntityRepository<User> {

	constructor(
		@InjectRepository(User) repository: EntityRepository<User>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(User, repository, transactionContext);
	}

	async findOneBy(query: FindOneUserQuery, options?: FindOptions<User>): Promise<User | undefined> {
		const normalizedQuery: FindOneUserQuery = {
			...query,
			...(query.email ? { email: query.email.toLowerCase() } : {}),
		};

		return super.findOneBy(normalizedQuery, options);
	}

	findOneForAuth(query: FindOneUserQuery): Promise<User | undefined> {
		return this.findOneBy(query);
	}

	async findActiveId(id: string): Promise<string | undefined> {
		const user = await this.repository.findOne(
			{ id, status: UserStatus.ACTIVE },
			{ fields: ['id'] },
		);

		return user?.id;
	}

}

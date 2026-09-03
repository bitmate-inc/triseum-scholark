import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { User } from '../model/user.entity';

@Injectable()
export class UserRepository extends MikroOrmEntityRepository<User> {

	constructor(
		@InjectRepository(User) repository: EntityRepository<User>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(User, repository, transactionContext);
	}

	findByEmail(email: string): Promise<User | null> {
		return this.repository.findOne({ email });
	}

	findById(id: string): Promise<User | null> {
		return this.repository.findOne({ id });
	}

	async save(user: User): Promise<User> {
		this.repository.getEntityManager().persist(user);
		await this.repository.getEntityManager().flush();
		return user;
	}

}

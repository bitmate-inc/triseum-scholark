import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { User } from '../../user/model/user.entity';
import { AccountSession } from '../model/account.session.entity';

@Injectable()
export class AccountSessionRepository extends MikroOrmEntityRepository<AccountSession> {

	constructor(
		@InjectRepository(AccountSession) repository: EntityRepository<AccountSession>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(AccountSession, repository, transactionContext);
	}

	findByValueHash(valueHash: string): Promise<AccountSession | null> {
		return this.repository.findOne({ valueHash }, { populate: ['user'] });
	}

	async save(session: AccountSession): Promise<AccountSession> {
		this.repository.getEntityManager().persist(session);
		await this.repository.getEntityManager().flush();
		return session;
	}

	async revokeForUser(user: User): Promise<void> {
		await this.repository.nativeUpdate({ user }, { revokedAt: new Date() });
	}

	async flush(): Promise<void> {
		await this.repository.getEntityManager().flush();
	}

}

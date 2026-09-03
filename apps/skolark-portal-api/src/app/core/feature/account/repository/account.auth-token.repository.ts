import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { User } from '../../user/model/user.entity';
import { AccountAuthToken, AccountAuthTokenType } from '../model/account.auth-token.entity';

@Injectable()
export class AccountAuthTokenRepository extends MikroOrmEntityRepository<AccountAuthToken> {

	constructor(
		@InjectRepository(AccountAuthToken) repository: EntityRepository<AccountAuthToken>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(AccountAuthToken, repository, transactionContext);
	}

	findByValueHash(type: AccountAuthTokenType, valueHash: string): Promise<AccountAuthToken | null> {
		return this.repository.findOne({ type, valueHash }, { populate: ['user'] });
	}

	async consumeActiveForUser(user: User, type: AccountAuthTokenType): Promise<void> {
		await this.repository.nativeUpdate({ consumedAt: null, type, user }, { consumedAt: new Date() });
	}

	async save(token: AccountAuthToken): Promise<AccountAuthToken> {
		this.repository.getEntityManager().persist(token);
		await this.repository.getEntityManager().flush();
		return token;
	}

	async flush(): Promise<void> {
		await this.repository.getEntityManager().flush();
	}

}

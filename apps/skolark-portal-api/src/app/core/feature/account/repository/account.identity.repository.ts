import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { User } from '../../user/model/user.entity';
import { AccountIdentity, AccountIdentityProvider } from '../model/account.identity.entity';

@Injectable()
export class AccountIdentityRepository extends MikroOrmEntityRepository<AccountIdentity> {

	constructor(
		@InjectRepository(AccountIdentity) repository: EntityRepository<AccountIdentity>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(AccountIdentity, repository, transactionContext);
	}

	findLocalByEmail(email: string): Promise<AccountIdentity | null> {
		return this.repository.findOne({
			provider: AccountIdentityProvider.LOCAL,
			providerAccountId: email,
		}, { populate: ['user'] });
	}

	findLocalByUser(user: User): Promise<AccountIdentity | null> {
		return this.repository.findOne({
			provider: AccountIdentityProvider.LOCAL,
			user,
		});
	}

	async save(identity: AccountIdentity): Promise<AccountIdentity> {
		this.repository.getEntityManager().persist(identity);
		await this.repository.getEntityManager().flush();
		return identity;
	}

}

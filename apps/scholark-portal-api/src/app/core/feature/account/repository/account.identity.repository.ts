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

	async findByProviderAndAccountId(query: {
		provider: AccountIdentityProvider;
		providerAccountId: string;
	}): Promise<AccountIdentity | undefined> {
		return await this.repository.findOne(query) ?? undefined;
	}

	findLocalByEmail(query: { email: string }): Promise<AccountIdentity | undefined> {
		return this.findByProviderAndAccountId({
			provider: AccountIdentityProvider.LOCAL,
			providerAccountId: query.email.trim().toLowerCase(),
		});
	}

	async findByUserAndProvider(query: {
		provider: AccountIdentityProvider;
		userId: string;
	}): Promise<AccountIdentity | undefined> {
		return await this.repository.findOne({
			provider: query.provider,
			user: query.userId,
		}) ?? undefined;
	}

	async createLocalIdentity(data: {
		email: string;
		passwordHash?: string;
		providerData?: Record<string, unknown>;
		user: User;
	}): Promise<AccountIdentity> {
		return this.save(AccountIdentity.createLocalIdentity(data));
	}	

}

import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { AccountAuthToken, AccountAuthTokenType } from '../model/account.auth-token.entity';

@Injectable()
export class AccountAuthTokenRepository extends MikroOrmEntityRepository<AccountAuthToken> {

	constructor(
		@InjectRepository(AccountAuthToken) repository: EntityRepository<AccountAuthToken>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(AccountAuthToken, repository, transactionContext);
	}

	async findActiveTokenByValue(query: {
		type: AccountAuthTokenType;
		valueHash: string;
	}): Promise<AccountAuthToken | undefined> {
		return await this.repository.findOne({
			consumedAt: null,
			expiresAt: { $gt: new Date() },
			type: query.type,
			valueHash: query.valueHash,
		}, { orderBy: { createdAt: 'DESC' } }) ?? undefined;
	}

	async findLatestActiveTokenByUserId(query: {
		type: AccountAuthTokenType;
		userId: string;
	}): Promise<AccountAuthToken | undefined> {
		return await this.repository.findOne({
			consumedAt: null,
			expiresAt: { $gt: new Date() },
			type: query.type,
			user: query.userId,
		}, { orderBy: { createdAt: 'DESC' } }) ?? undefined;
	}

	async invalidateActiveTokensByUserId(query: {
		type: AccountAuthTokenType;
		userId: string;
	}): Promise<void> {
		const now = new Date();

		await this.repository.nativeUpdate({
			consumedAt: null,
			expiresAt: { $gt: now },
			type: query.type,
			user: query.userId,
		}, { expiresAt: now });
	}

}

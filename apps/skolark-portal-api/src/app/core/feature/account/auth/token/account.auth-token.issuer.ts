import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import authConfig from '../../../../../../config/auth';
import { User } from '../../../user/model/user.entity';
import { AccountAuthToken, AccountAuthTokenType } from '../../model/account.auth-token.entity';
import { AccountAuthTokenRepository } from '../../repository/account.auth-token.repository';
import { hashAccountAuthToken } from './account.auth-token.hash';

export interface IssueAccountAuthTokenResult {
	token: AccountAuthToken;
	value: string;
}

@Injectable()
export class AccountAuthTokenIssuer {

	constructor(
		private readonly repository: AccountAuthTokenRepository,
		@Inject(authConfig.KEY)
		private readonly config: ConfigType<typeof authConfig>,
	) {}

	async issue(data: {
		type: AccountAuthTokenType;
		user: User;
	}): Promise<IssueAccountAuthTokenResult> {
		await this.repository.invalidateActiveTokensByUserId({
			type: data.type,
			userId: data.user.id!,
		});

		const value = AccountAuthToken.createTokenValue();

		const token = AccountAuthToken.create({
			expiresAt: new Date(Date.now() + this.config.tokenTtlSeconds * 1000),
			type: data.type,
			user: data.user,
			valueHash: hashAccountAuthToken(value),
		});
		
		await this.repository.save(token);

		return { token, value };
	}

}
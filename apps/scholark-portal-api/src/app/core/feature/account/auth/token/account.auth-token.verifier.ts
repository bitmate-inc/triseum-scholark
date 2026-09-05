import { Injectable } from '@nestjs/common';

import { AccountAuthToken, AccountAuthTokenType } from '../../model/account.auth-token.entity';
import { AccountAuthTokenRepository } from '../../repository/account.auth-token.repository';
import { hashAccountAuthToken } from './account.auth-token.hash';

@Injectable()
export class AccountAuthTokenVerifier {

	constructor(
		private readonly repository: AccountAuthTokenRepository,
	) {}

	async findActive(data: {
		type: AccountAuthTokenType;
		value: string;
	}): Promise<AccountAuthToken | undefined> {
		return this.repository.findActiveTokenByValue({
			type: data.type,
			valueHash: hashAccountAuthToken(data.value),
		});
	}

}
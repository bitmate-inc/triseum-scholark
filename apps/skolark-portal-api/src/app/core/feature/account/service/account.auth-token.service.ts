import { createHash, randomBytes } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import authConfig from '../../../../../config/auth';
import { User } from '../../user/model/user.entity';
import { AccountAuthToken, AccountAuthTokenType } from '../model/account.auth-token.entity';
import { AccountAuthTokenRepository } from '../repository/account.auth-token.repository';

@Injectable()
export class AccountAuthTokenService {

	constructor(
		private readonly repository: AccountAuthTokenRepository,
		@Inject(authConfig.KEY)
		private readonly config: ConfigType<typeof authConfig>,
	) {}

	async issue(user: User, type: AccountAuthTokenType): Promise<string> {
		await this.repository.consumeActiveForUser(user, type);
		const value = randomBytes(32).toString('base64url');
		const token = new AccountAuthToken();
		token.expiresAt = new Date(Date.now() + this.config.tokenTtlSeconds * 1000);
		token.type = type;
		token.user = user;
		token.valueHash = this.hash(value);
		await this.repository.save(token);

		return value;
	}

	async findActive(value: string, type: AccountAuthTokenType): Promise<AccountAuthToken | undefined> {
		const token = await this.repository.findByValueHash(type, this.hash(value));

		if (!token?.isActive()) {
			return undefined;
		}

		return token;
	}

	async consume(token: AccountAuthToken): Promise<void> {
		token.consumedAt = new Date();
		await this.repository.flush();
	}

	private hash(value: string): string {
		return createHash('sha256').update(value).digest('base64url');
	}

}

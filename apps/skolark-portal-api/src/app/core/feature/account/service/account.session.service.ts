import { createHash, randomBytes } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import authConfig from '../../../../../config/auth';
import { User } from '../../user/model/user.entity';
import { AccountSession } from '../model/account.session.entity';
import { AccountSessionRepository } from '../repository/account.session.repository';

@Injectable()
export class AccountSessionService {

	constructor(
		private readonly repository: AccountSessionRepository,
		@Inject(authConfig.KEY)
		private readonly config: ConfigType<typeof authConfig>,
	) {}

	async create(user: User): Promise<string> {
		const value = randomBytes(32).toString('base64url');
		const session = new AccountSession();
		session.expiresAt = new Date(Date.now() + this.config.sessionTtlSeconds * 1000);
		session.user = user;
		session.valueHash = this.hash(value);
		await this.repository.save(session);

		return value;
	}

	async findUser(value?: string): Promise<User | undefined> {
		if (!value) {
			return undefined;
		}

		const session = await this.repository.findByValueHash(this.hash(value));
		return session?.isActive() ? session.user : undefined;
	}

	async revoke(value?: string): Promise<void> {
		if (!value) {
			return;
		}

		const session = await this.repository.findByValueHash(this.hash(value));
		if (session?.isActive()) {
			session.revokedAt = new Date();
			await this.repository.flush();
		}
	}

	revokeForUser(user: User): Promise<void> {
		return this.repository.revokeForUser(user);
	}

	private hash(value: string): string {
		return createHash('sha256').update(value).digest('base64url');
	}

}

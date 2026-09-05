import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { RedisClientType } from '@redis/client';

import authConfig from '../../../../../../config/auth';
import { RedisClient } from '../../../redis/redis.module';

type StoredSession = {
	passport?: {
		user?: string;
	};
};

@Injectable()
export class RedisExpressSessionRevoker {

	constructor(
		@Inject(RedisClient()) private readonly redisClient: RedisClientType,
		@Inject(authConfig.KEY) private readonly auth: ConfigType<typeof authConfig>,
	) {}

	async revoke(userId: string): Promise<void> {
		for await (const keys of this.redisClient.scanIterator({
			COUNT: 100,
			MATCH: `${this.auth.session.redisPrefix}*`,
		})) {
			const values = await this.redisClient.mGet(keys);
			const matchingKeys = keys.filter((_, index) => hasPassportUser(values[index], userId));

			if (matchingKeys.length > 0) {
				await this.redisClient.del(matchingKeys);
			}
		}
	}

}

function hasPassportUser(value: string | null, userId: string): boolean {
	if (!value) {
		return false;
	}

	try {
		return (JSON.parse(value) as StoredSession).passport?.user === userId;
	} catch {
		return false;
	}
}
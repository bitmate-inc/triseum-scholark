import {
	describe,
	expect,
	it,
	jest,
} from '@jest/globals';
import type { ConfigType } from '@nestjs/config';
import type { RedisClientType } from '@redis/client';

import authConfig from '../../../../../../config/auth';
import { RedisExpressSessionRevoker } from './redis.express-session.revoker';

describe(RedisExpressSessionRevoker.name, () => {
	it('scans only session keys and deletes sessions serialized for the user', async () => {
		async function* scanIterator(): AsyncGenerator<string[]> {
			yield ['test:session:one', 'test:session:two'];
			yield ['test:session:three', 'test:session:expired'];
		}

		const redisClient = {
			del: jest.fn<(keys: string[]) => Promise<number>>().mockResolvedValue(1),
			mGet: jest.fn<(keys: string[]) => Promise<Array<string | null>>>()
				.mockResolvedValueOnce([
					JSON.stringify({ passport: { user: 'target-user' } }),
					JSON.stringify({ passport: { user: 'other-user' } }),
				])
				.mockResolvedValueOnce(['not-json', null]),
			scanIterator: jest.fn((options?: { COUNT: number; MATCH: string }) => {
				void options;
				return scanIterator();
			}),
		};
		const auth = {
			session: { redisPrefix: 'test:session:' },
		} as ConfigType<typeof authConfig>;
		const revoker = new RedisExpressSessionRevoker(
			redisClient as unknown as RedisClientType,
			auth,
		);

		await revoker.revoke('target-user');

		expect(redisClient.scanIterator).toHaveBeenCalledWith({
			COUNT: 100,
			MATCH: 'test:session:*',
		});
		expect(redisClient.del).toHaveBeenCalledTimes(1);
		expect(redisClient.del).toHaveBeenCalledWith(['test:session:one']);
	});
});
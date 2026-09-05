import {
	describe,
	expect,
	it
} from '@jest/globals';

import { getPostgreSqlDriverOptions } from './mikro-orm';

describe(getPostgreSqlDriverOptions.name, () => {
	it('enables TLS and channel binding requested by a Neon URL', () => {
		expect(getPostgreSqlDriverOptions(
			'postgresql://user:password@example.neon.tech/database?sslmode=require&channel_binding=require',
		)).toEqual({
			enableChannelBinding: true,
			ssl: true,
		});
	});

	it('keeps a local URL on its default transport', () => {
		expect(getPostgreSqlDriverOptions(
			'postgresql://user:password@localhost:5432/database',
		)).toEqual({});
	});

	it('respects an explicit request to disable TLS', () => {
		expect(getPostgreSqlDriverOptions(
			'postgresql://user:password@localhost:5432/database?sslmode=disable',
		)).toEqual({});
	});
});
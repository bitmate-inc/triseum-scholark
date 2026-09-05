import { registerAs } from '@nestjs/config';
import Joi from 'joi';

import type { RedisModuleConfig } from '../app/core/infrastructure/redis/redis.module.config';

export const envSchema = {
	REDIS_HOST: Joi.string().required(),
	REDIS_PORT: Joi.number().port().required(),
};

export default registerAs('redis', () => {
	const host = process.env.REDIS_HOST!;
	const port = Number.parseInt(process.env.REDIS_PORT!, 10);

	return {
		connections: [{ url: `redis://${host}:${port}` }],
		host,
		port,
	} as RedisModuleConfig & { host: string; port: number };
});
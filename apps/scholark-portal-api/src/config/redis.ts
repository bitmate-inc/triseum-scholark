import { registerAs } from '@nestjs/config';
import Joi from 'joi';

import { DEFAULT_NAME, type RedisModuleConfig } from '../app/core/infrastructure/redis/redis.module.config';

export const envSchema = {
	REDIS_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).required(),
};

export default registerAs('redis', (): RedisModuleConfig => ({
	connections: [{ name: DEFAULT_NAME, url: process.env.REDIS_URL! }],
}));
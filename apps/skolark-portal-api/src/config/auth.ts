import { registerAs } from '@nestjs/config';
import Joi from 'joi';

import { parseBoolean, parseNumber } from '../lib/config/parse-env';

export const envSchema = {
	AUTH_COOKIE_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
	AUTH_SESSION_COOKIE_NAME: Joi.string().default('skolark_session'),
	AUTH_SESSION_TTL_SECONDS: Joi.number().integer().positive().default(604800),
	AUTH_TOKEN_TTL_SECONDS: Joi.number().integer().positive().default(86400),
};

export default registerAs('auth', () => ({
	cookie: {
		name: process.env.AUTH_SESSION_COOKIE_NAME ?? 'skolark_session',
		secure: parseBoolean(process.env.AUTH_COOKIE_SECURE),
	},
	sessionTtlSeconds: parseNumber(process.env.AUTH_SESSION_TTL_SECONDS, 604800),
	tokenTtlSeconds: parseNumber(process.env.AUTH_TOKEN_TTL_SECONDS, 86400),
}));
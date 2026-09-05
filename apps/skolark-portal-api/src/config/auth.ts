import { registerAs } from '@nestjs/config';
import Joi from 'joi';

import { parseBoolean, parseNumber } from '../lib/config/parse-env';

export const envSchema = {
	AUTH_COOKIE_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
	AUTH_GOOGLE_CALLBACK_URL: Joi.string().uri().optional(),
	AUTH_GOOGLE_CLIENT_ID: Joi.string().optional(),
	AUTH_GOOGLE_CLIENT_SECRET: Joi.string().optional(),
	AUTH_JWT_SECRET: Joi.string().min(32).required(),
	AUTH_MICROSOFT_CALLBACK_URL: Joi.string().uri().optional(),
	AUTH_MICROSOFT_CLIENT_ID: Joi.string().optional(),
	AUTH_MICROSOFT_CLIENT_SECRET: Joi.string().optional(),
	AUTH_MICROSOFT_TENANT_ID: Joi.string().optional(),
	AUTH_SESSION_COOKIE_NAME: Joi.string().default('skolark_session'),
	AUTH_SESSION_REDIS_PREFIX: Joi.string().default('skolark:session:'),
	AUTH_SESSION_SECRET: Joi.string().min(32).required(),
	AUTH_SESSION_TTL_SECONDS: Joi.number().integer().positive().default(604800),
	AUTH_TOKEN_TTL_SECONDS: Joi.number().integer().positive().default(86400),
};

export default registerAs('auth', () => ({
	google: {
		callbackUrl: process.env.AUTH_GOOGLE_CALLBACK_URL,
		clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
		clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
	},
	jwt: {
		secret: process.env.AUTH_JWT_SECRET!,
	},
	microsoft: {
		callbackUrl: process.env.AUTH_MICROSOFT_CALLBACK_URL,
		clientId: process.env.AUTH_MICROSOFT_CLIENT_ID,
		clientSecret: process.env.AUTH_MICROSOFT_CLIENT_SECRET,
		tenantId: process.env.AUTH_MICROSOFT_TENANT_ID,
	},
	session: {
		cookie: {
			httpOnly: true,
			maxAge: parseNumber(process.env.AUTH_SESSION_TTL_SECONDS, 604800) * 1000,
			sameSite: 'strict' as const,
			secure: parseBoolean(process.env.AUTH_COOKIE_SECURE),
		},
		name: process.env.AUTH_SESSION_COOKIE_NAME ?? 'skolark_session',
		redisPrefix: process.env.AUTH_SESSION_REDIS_PREFIX ?? 'skolark:session:',
		resave: false,
		rolling: true,
		saveUninitialized: false,
		secret: process.env.AUTH_SESSION_SECRET!,
		ttlSeconds: parseNumber(process.env.AUTH_SESSION_TTL_SECONDS, 604800),
	},
	tokenTtlSeconds: parseNumber(process.env.AUTH_TOKEN_TTL_SECONDS, 86400),
}));
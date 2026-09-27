import { registerAs } from '@nestjs/config';
import Joi from 'joi';

import { parseBoolean, parseNumber } from '../lib/config/parse-env';

export const envSchema = {
	GAME_PROXY_ALLOW_HTTP_UPSTREAM: Joi.boolean().truthy('true').falsy('false').default(false),
	GAME_PROXY_ALLOW_SAME_ORIGIN_DEV: Joi.boolean().truthy('true').falsy('false').default(false),
	GAME_PROXY_COOKIE_NAME: Joi.string().default('scholark_game'),
	GAME_PROXY_PUBLIC_ORIGIN: Joi.string().uri({ scheme: ['http', 'https'] }).empty('').optional(),
	GAME_PROXY_SESSION_TTL_SECONDS: Joi.number().integer().min(60).max(86400).default(3600),
	GAME_PROXY_TICKET_TTL_SECONDS: Joi.number().integer().min(10).max(120).default(60),
};

export default registerAs('gameProxy', () => {
	const publicOrigin = process.env.GAME_PROXY_PUBLIC_ORIGIN?.trim();
	const allowSameOriginDev = parseBoolean(process.env.GAME_PROXY_ALLOW_SAME_ORIGIN_DEV);
	const isProduction = process.env.NODE_ENV === 'production';

	if (isProduction && !publicOrigin) {
		throw new Error('GAME_PROXY_PUBLIC_ORIGIN is required in production');
	}
	if (isProduction && allowSameOriginDev) {
		throw new Error('GAME_PROXY_ALLOW_SAME_ORIGIN_DEV cannot be enabled in production');
	}
	if (isProduction && publicOrigin && new URL(publicOrigin).protocol !== 'https:') {
		throw new Error('GAME_PROXY_PUBLIC_ORIGIN must use HTTPS in production');
	}

	const resolvedPublicOrigin = publicOrigin
		? new URL(publicOrigin).origin
		: allowSameOriginDev && !isProduction
			? `http://localhost:${process.env.PORT ?? '3001'}`
			: undefined;

	return {
		allowHttpUpstream: parseBoolean(process.env.GAME_PROXY_ALLOW_HTTP_UPSTREAM),
		allowSameOriginDev,
		cookieName: process.env.GAME_PROXY_COOKIE_NAME ?? 'scholark_game',
		publicOrigin: resolvedPublicOrigin,
		sessionTtlSeconds: parseNumber(process.env.GAME_PROXY_SESSION_TTL_SECONDS, 3600),
		ticketTtlSeconds: parseNumber(process.env.GAME_PROXY_TICKET_TTL_SECONDS, 60),
	};
});
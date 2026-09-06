import { registerAs } from '@nestjs/config';
import Joi from 'joi';

import { parseBoolean } from '../lib/config/parse-env';

export const envSchema = {
	CORS_ORIGIN: Joi.string().trim().empty('').optional(),
	PORT: Joi.number().port().required(),
	TRUST_PROXY: Joi.boolean()
		.truthy('true')
		.falsy('false')
		.empty('')
		.optional(),
};

export function parseCorsOrigin(value?: string): true | string[] {
	const originList = value
		?.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean) ?? [];

	if (originList.length === 0) {
		return true;
	}

	return originList;
}

export default registerAs('server', () => ({
	cors: {
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
		exposedHeaders: ['Link'],
		methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'],
		origin: parseCorsOrigin(process.env.CORS_ORIGIN),
	},
	server: {
		port: Number(process.env.PORT),
		trustProxy: parseBoolean(process.env.TRUST_PROXY),
	},
	websocket: {
		adapter: process.env.WEBSOCKET_ADAPTER,
	},
}));
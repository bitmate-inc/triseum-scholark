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

export default registerAs('server', () => ({
	cors: {
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
		exposedHeaders: ['Link'],
		methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'],
		origin: process.env.CORS_ORIGIN
			?.split(',')
			.map((origin) => origin.trim())
			.filter(Boolean) ?? true,
	},
	server: {
		port: Number(process.env.PORT),
		trustProxy: parseBoolean(process.env.TRUST_PROXY),
	},
	websocket: {
		adapter: process.env.WEBSOCKET_ADAPTER,
	},
}));
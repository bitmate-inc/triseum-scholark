import { registerAs } from '@nestjs/config';
import Joi from 'joi';

import { parseBoolean, parseNumber } from '../lib/config/parse-env';

export const envSchema = {
	PORT: Joi.number().port().default(3001),
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
		origin: true,
	},
	server: {
		port: parseNumber(process.env.PORT, 3001),
		trustProxy: parseBoolean(process.env.TRUST_PROXY),
	},
	websocket: {
		adapter: process.env.WEBSOCKET_ADAPTER,
	},
}));
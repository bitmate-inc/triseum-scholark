import { registerAs } from '@nestjs/config';
import Joi from 'joi';

import { parseBoolean, parseNumber } from '../lib/config/parse-env';

export interface NodemailerConfig {
	auth?: {
		pass?: string;
		user: string;
	};
	host?: string;
	jsonTransport?: boolean;
	port?: number;
	secure?: boolean;
}

export const envSchema = {
	SMTP_JSON_TRANSPORT: Joi.string().empty('').optional(),
	SMTP_HOST: Joi.string().empty('').optional(),
	SMTP_PORT: Joi.number().empty('').optional(),
	SMTP_SECURE: Joi.string().empty('').optional(),
};

export default registerAs('nodemailer', (): NodemailerConfig => {
	const config: NodemailerConfig = {};
	let auth: NodemailerConfig['auth'];

	if (typeof process.env.SMTP_JSON_TRANSPORT !== 'undefined') {
		config.jsonTransport = parseBoolean(process.env.SMTP_JSON_TRANSPORT);
	}

	if (process.env.SMTP_HOST) {
		config.host = process.env.SMTP_HOST;
	}

	if (typeof process.env.SMTP_PORT !== 'undefined') {
		config.port = parseNumber(process.env.SMTP_PORT, 0);
	}

	if (typeof process.env.SMTP_SECURE !== 'undefined') {
		config.secure = parseBoolean(process.env.SMTP_SECURE);
	}

	if (!!process.env.SMTP_USER) {
		auth = {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD,
		};
	}

	return {
		...config,
		auth,
	};
});

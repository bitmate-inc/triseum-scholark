import { registerAs } from '@nestjs/config';
import Joi from 'joi';

import { parseBoolean } from '../lib/config/parse-env';

export const envSchema = {
	SWAGGER_PERSIST_AUTHORIZATION: Joi.boolean()
		.truthy('true')
		.falsy('false')
		.empty('')
		.optional(),
};

export default registerAs('swagger', () => ({
	document: {
		description: 'Portal services for the ScholArk game platform.',
		title: 'ScholArk Portal API',
		version: '1.0',
	},
	path: 'api/v1/doc',
	setup: {
		customSiteTitle: 'ScholArk Portal API',
		jsonDocumentUrl: 'api/v1/doc-json',
		persistAuthorization: parseBoolean(
			process.env.SWAGGER_PERSIST_AUTHORIZATION,
		),
	},
}));
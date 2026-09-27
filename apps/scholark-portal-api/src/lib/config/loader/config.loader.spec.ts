import { join } from 'node:path';

import {
	describe,
	expect,
	it,
	jest
} from '@jest/globals';
import Joi from 'joi';

jest.mock('@mikro-orm/core', () => ({
	defineConfig: jest.fn((config: unknown) => config),
}));
jest.mock('@mikro-orm/decorators/legacy', () => ({
	ReflectMetadataProvider: class ReflectMetadataProvider {},
}));
jest.mock('@mikro-orm/migrations', () => ({
	Migrator: class Migrator {},
}));
jest.mock('@mikro-orm/postgresql', () => ({
	PostgreSqlDriver: class PostgreSqlDriver {},
}));

import {
	buildValidationSchema,
	ConfigDefinition,
	loadConfigFromDirectory,
} from './config.loader';

describe('config loader', () => {
	it('autoloads config factories and their environment schemas', () => {
		const definitionList = loadConfigFromDirectory(
			join(__dirname, '../../../config'),
		);
		const validationSchema = buildValidationSchema(definitionList);

		expect(definitionList).toHaveLength(11);
		expect(
			validationSchema?.validate({
				CORS_ORIGIN: '',
				AUTH_CONFIRM_EMAIL_FROM: 'noreply@scholark.com',
				AUTH_CONFIRM_EMAIL_SUBJECT: 'Confirm your email',
				AUTH_CONFIRM_EMAIL_URL: 'http://localhost:3000/auth/confirm-email?token=:token',
				AUTH_JWT_SECRET: 'test-jwt-secret-at-least-32-characters',
				AUTH_RESET_PASSWORD_EMAIL_FROM: 'noreply@scholark.com',
				AUTH_RESET_PASSWORD_EMAIL_SUBJECT: 'Reset your password',
				AUTH_UPDATE_PASSWORD_URL: 'http://localhost:3000/auth/reset-password?token=:token',
				DEBUG_PREFIX: 'app',
				MIKRO_ORM_DATABASE_URL: 'postgresql://localhost:5432/scholark',
				PORT: 3001,
				AUTH_SESSION_SECRET: 'test-session-secret-at-least-32-characters',
				REDIS_URL: 'redis://localhost:6379',
				STRIPE_API_KEY: 'sk_test_config_loader',
				STRIPE_PORTAL_URL: 'http://localhost:3000/billing/portal',
				STRIPE_WEBHOOK_SECRET: 'whsec_config_loader',
			}).error,
		).toBeUndefined();
	});

	it('rejects duplicate environment schema definitions', () => {
		const config = (() => ({})) as ConfigDefinition['config'];
		const definitionList: ConfigDefinition[] = [
			{ config, envSchema: { PORT: Joi.number() } },
			{ config, envSchema: { PORT: Joi.string() } },
		];

		expect(() => buildValidationSchema(definitionList)).toThrow(
			'Duplicate env var schema definition for "PORT"',
		);
	});
});
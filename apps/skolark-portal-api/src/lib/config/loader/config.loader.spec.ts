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

		expect(definitionList).toHaveLength(5);
		expect(
			validationSchema?.validate({
				DEBUG_PREFIX: 'app',
				MIKRO_ORM_DATABASE_URL: 'postgresql://localhost:5432/skolark',
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
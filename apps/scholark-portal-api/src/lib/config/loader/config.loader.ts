import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import type { ConfigFactory } from '@nestjs/config';
import Joi from 'joi';

export type ConfigEnvSchema = Record<string, Joi.Schema>;

export interface ConfigDefinition {
	config: ConfigFactory;
	envSchema?: ConfigEnvSchema;
}

interface ImportedConfigModule {
	default?: ConfigFactory;
	envSchema?: ConfigEnvSchema;
}

export function loadConfigFromDirectory(dirPath: string): ConfigDefinition[] {
	return getConfigFileList(dirPath)
		.map((filePath) => {
			// Config files are discovered at runtime in both src and compiled dist.
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const importedModule = require(filePath) as ImportedConfigModule;
			return normalizeImportedConfigModule(importedModule);
		})
		.filter(
			(definition): definition is ConfigDefinition => definition !== null,
		);
}

export function buildValidationSchema(
	configDefinitionList: ConfigDefinition[],
): Joi.ObjectSchema | undefined {
	const schemaMap: ConfigEnvSchema = {};

	for (const definition of configDefinitionList) {
		if (!definition.envSchema) {
			continue;
		}

		for (const [environmentVariable, schema] of Object.entries(
			definition.envSchema,
		)) {
			if (environmentVariable in schemaMap) {
				throw new Error(
					`Duplicate env var schema definition for "${environmentVariable}"`,
				);
			}

			schemaMap[environmentVariable] = schema;
		}
	}

	return Object.keys(schemaMap).length > 0 ? Joi.object(schemaMap) : undefined;
}

function getConfigFileList(dirPath: string): string[] {
	return readdirSync(dirPath)
		.sort()
		.flatMap((entryName) => {
			const entryPath = join(dirPath, entryName);

			if (statSync(entryPath).isDirectory()) {
				return getConfigFileList(entryPath);
			}

			return isConfigFile(entryName) ? [entryPath] : [];
		});
}

function isConfigFile(fileName: string): boolean {
	return (
		(fileName.endsWith('.ts') || fileName.endsWith('.js')) &&
    !fileName.endsWith('.d.ts') &&
    !fileName.endsWith('.spec.ts') &&
    !fileName.endsWith('.test.ts')
	);
}

function normalizeImportedConfigModule(
	importedModule: ImportedConfigModule,
): ConfigDefinition | null {
	if (typeof importedModule.default !== 'function') {
		return null;
	}

	return {
		config: importedModule.default,
		envSchema: importedModule.envSchema,
	};
}
import { existsSync, readFileSync } from 'node:fs';

import { Injectable } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';

import { getEnvFilePath } from '../../../lib/config/env-file';

const EXCLUDED_ENVIRONMENT_VARIABLE_NAME_SET = new Set(['PORT']);

@Injectable()
@Command({
	name: 'env:export',
	description: 'Export the resolved application environment as dotenv',
})
export class ExportEnvironmentCli extends CommandRunner {

	run(): Promise<void> {
		const environmentVariableNameSet = this.getEnvironmentVariableNameSet();

		for (const name of environmentVariableNameSet) {
			const value = process.env[name];

			if (
				!EXCLUDED_ENVIRONMENT_VARIABLE_NAME_SET.has(name) &&
				typeof value === 'string' &&
				value.length > 0
			) {
				process.stdout.write(`${name}=${JSON.stringify(value)}\n`);
			}
		}

		return Promise.resolve();
	}

	private getEnvironmentVariableNameSet(): Set<string> {
		const environmentVariableNameSet = new Set<string>(['NODE_ENV']);
		const envFilePathList = getEnvFilePath().filter(existsSync);

		for (const filePath of envFilePathList.toReversed()) {
			const file = readFileSync(filePath, 'utf8');

			for (const match of file.matchAll(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/gm)) {
				environmentVariableNameSet.add(match[1]);
			}
		}

		return environmentVariableNameSet;
	}

}
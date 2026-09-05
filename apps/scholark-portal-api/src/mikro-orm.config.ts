/*
 * This file is meant to be used only with MikroORM CLI tools.
 *
 * !! DO NOT USE THE FILE IN NESTJS !!
 */

import { ConfigModule } from '@nestjs/config';

import { createConfig } from './config/mikro-orm';
import { getEnvFilePath } from './lib/config/env-file';

/*
 * Load env vars
 */

/*
 * Load ormconfig
 */
export default async () => {
	await ConfigModule.forRoot({
		envFilePath: getEnvFilePath(),
		expandVariables: true,
	});

	const config = createConfig();

	// console.log('MikroORM config:', config);

	return config;
};
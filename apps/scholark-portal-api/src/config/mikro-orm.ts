import { defineConfig } from '@mikro-orm/core';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { registerAs } from '@nestjs/config';
import Joi from 'joi';


export const envSchema = {
	MIKRO_ORM_DATABASE_URL: Joi.string().uri().required(),
	MIKRO_ORM_DEBUG: Joi.boolean()
		.truthy('true')
		.falsy('false')
		.empty('')
		.default(false),
};

export function getPostgreSqlDriverOptions(clientUrl?: string): Record<string, boolean> {
	if (!clientUrl) {
		return {};
	}

	const url = new URL(clientUrl);
	const sslMode = url.searchParams.get('sslmode');
	const channelBinding = url.searchParams.get('channel_binding');
	const driverOptions: Record<string, boolean> = {};

	if (sslMode && sslMode !== 'disable') {
		driverOptions.ssl = true;
	}

	if (channelBinding === 'prefer' || channelBinding === 'require') {
		driverOptions.enableChannelBinding = true;
	}

	return driverOptions;
}

export function createConfig() {
	const clientUrl = process.env.MIKRO_ORM_DATABASE_URL;

	return defineConfig({
		clientUrl,
		debug: process.env.MIKRO_ORM_DEBUG === 'true',
		driver: PostgreSqlDriver,
		driverOptions: getPostgreSqlDriverOptions(clientUrl),
		entities: ['./dist/app/core/**/*.entity.js'],
		entitiesTs: ['./src/app/core/**/*.entity.ts'],
		metadataProvider: ReflectMetadataProvider,
		extensions: [Migrator],
		migrations: {
			path: './dist/migration',
			pathTs: './src/migration',
		},
		seeder: {
			defaultSeeder: 'DatabaseSeeder',
			path: './dist/seeder',
			pathTs: './src/seeder',
		},
	});
}

export default registerAs('database', () => {
	return createConfig();
});
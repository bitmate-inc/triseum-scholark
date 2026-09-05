import { defineConfig } from '@mikro-orm/core';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
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

export function createConfig(){
	return defineConfig({
		clientUrl: process.env.MIKRO_ORM_DATABASE_URL,
		debug: process.env.MIKRO_ORM_DEBUG === 'true',
		driver: PostgreSqlDriver,
		entities: ['./dist/app/core/**/*.entity.js'],
		entitiesTs: ['./src/app/core/**/*.entity.ts'],
		metadataProvider: ReflectMetadataProvider,
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
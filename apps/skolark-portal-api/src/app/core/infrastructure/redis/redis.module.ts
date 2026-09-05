import {
	DynamicModule,
	Module,
	Provider
} from '@nestjs/common';
import type { RedisClientOptions } from '@redis/client';

import { isString, trimAndNullEmptyString } from '../../../../lib/util/string';
import { ConfigProvider, ConfigProviderAsyncOptions } from '../config/config.provider';
import { DEFAULT_CONNECTION, RedisConnectionRegistry } from './redis.connection.registry';
import { RedisModuleConfig } from './redis.module.config';

export { DEFAULT_CONNECTION } from './redis.connection.registry';

export type RedisModuleAsyncOptions = ConfigProviderAsyncOptions<RedisModuleConfig>;
type ConnectionSelection = string | string[] | undefined;

export function RedisClient(connectionName: string = DEFAULT_CONNECTION): string {
	return `REDIS_CLIENT(${connectionName})`;
}

export function RedisConfig(connectionName: string = DEFAULT_CONNECTION): string {
	return `REDIS_CONFIG(${connectionName})`;
}

@Module({})
export class RedisModule {

	static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
		const providers: Provider[] = [
			ConfigProvider.createAsync(RedisModuleConfig, options, { preserveUnknownFields: true }),
			RedisConnectionRegistry,
		];

		return {
			exports: providers,
			global: true,
			imports: options.imports ?? [],
			module: RedisModule,
			providers,
		};
	}

	static forConnection(connectionName?: ConnectionSelection): DynamicModule {
		const providers = createProviders(normalizeConnectionNames(connectionName));

		return {
			exports: providers,
			module: RedisModule,
			providers,
		};
	}

}

function createProviders(connectionNames: string[]): Provider[] {
	return [
		...connectionNames.map((connectionName) => ({
			provide: RedisConfig(connectionName),
			inject: [RedisConnectionRegistry],
			useFactory: (registry: RedisConnectionRegistry): RedisClientOptions => registry.getConfig(connectionName),
		})),
		...connectionNames.map((connectionName) => ({
			provide: RedisClient(connectionName),
			inject: [RedisConnectionRegistry],
			useFactory: (registry: RedisConnectionRegistry) => registry.getClient(connectionName),
		})),
	];
}

function normalizeConnectionNames(connectionName?: ConnectionSelection): string[] {
	if (typeof connectionName === 'undefined') {
		return [DEFAULT_CONNECTION];
	}

	if (Array.isArray(connectionName)) {
		const names = connectionName
			.filter((name): name is string => isString(name))
			.map((name) => trimAndNullEmptyString(name))
			.filter((name): name is string => !!name);
		const uniqueNames = Array.from(new Set(names));

		if (uniqueNames.length === 0) {
			throw new Error('[RedisModule] forConnection(...) array contains no valid connection names');
		}

		return uniqueNames;
	}

	const normalizedName = trimAndNullEmptyString(connectionName);
	if (!normalizedName) {
		throw new Error('[RedisModule] forConnection(...) received an empty connection name');
	}

	return [normalizedName];
}
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { createClient, RedisClientOptions } from '@redis/client';

import {
	DEFAULT_NAME,
	RedisConnectionConfig,
	RedisModuleConfig
} from './redis.module.config';

type ManagedRedisClient = ReturnType<typeof createClient>;
export const DEFAULT_CONNECTION = DEFAULT_NAME;

@Injectable()
export class RedisConnectionRegistry implements OnApplicationShutdown {

	private readonly clientMap: Map<string, ManagedRedisClient>;
	private readonly configMap: Map<string, RedisClientOptions>;

	constructor(private readonly config: RedisModuleConfig) {
		this.configMap = config.connections.reduce<Map<string, RedisClientOptions>>((result, connection) => {
			result.set(connection.name, toRedisClientOptions(connection));
			return result;
		}, new Map<string, RedisClientOptions>());
		this.clientMap = config.connections.reduce<Map<string, ManagedRedisClient>>((result, connection) => {
			result.set(connection.name, createClient(this.getConfig(connection.name)));
			return result;
		}, new Map<string, ManagedRedisClient>());
	}

	getConfig(connectionName: string = DEFAULT_CONNECTION): RedisClientOptions {
		const normalizedConnectionName = normalizeConnectionName(connectionName);
		const config = this.configMap.get(normalizedConnectionName);

		if (!config) {
			throw new Error(`[RedisModule] Missing config for connection "${normalizedConnectionName}"`);
		}

		return config;
	}

	getClient(connectionName: string = DEFAULT_CONNECTION): ManagedRedisClient {
		const normalizedConnectionName = normalizeConnectionName(connectionName);
		const client = this.clientMap.get(normalizedConnectionName);

		if (!client) {
			throw new Error(`[RedisModule] Missing config for connection "${normalizedConnectionName}"`);
		}

		return client;
	}

	hasClient(connectionName: string = DEFAULT_CONNECTION): boolean {
		return this.clientMap.has(normalizeConnectionName(connectionName));
	}

	getConnectionNames(): string[] {
		return Array.from(this.clientMap.keys());
	}

	async onApplicationShutdown(): Promise<void> {
		await Promise.all(Array.from(this.clientMap.values()).map(async (client) => {
			if (client.isOpen) {
				await client.quit();
			}
		}));
	}

}

function toRedisClientOptions(connection: RedisConnectionConfig): RedisClientOptions {
	const redisOptions = { ...connection };
	delete (redisOptions as { name?: string }).name;
	return redisOptions;
}

function normalizeConnectionName(connectionName?: string): string {
	if (!connectionName || connectionName.trim().length === 0) {
		return DEFAULT_CONNECTION;
	}

	return connectionName;
}
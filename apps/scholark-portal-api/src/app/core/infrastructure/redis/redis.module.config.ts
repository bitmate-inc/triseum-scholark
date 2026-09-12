import type { RedisClientOptions } from '@redis/client';
import { Transform, Type } from 'class-transformer';
import {
	ArrayNotEmpty,
	ArrayUnique,
	IsArray,
	IsNotEmpty,
	IsString,
	ValidateNested,
} from 'class-validator';

import { DeepStaticFactory, StaticFactory } from '../../../../lib/factory/static.factory';
import { trimAndNullEmptyString } from '../../../../lib/util/string';

export const DEFAULT_NAME = 'default';

export class RedisConnectionConfig extends StaticFactory implements RedisClientOptions {

	@Transform(({ value }) => trimAndNullEmptyString(value))
	@IsNotEmpty()
	@IsString()
	name: string = DEFAULT_NAME;

	@IsNotEmpty()
	@IsString()
	url!: string;

	[key: string]: unknown;

}

export class RedisModuleConfig extends DeepStaticFactory {

	@IsArray()
	@ArrayNotEmpty()
	@ArrayUnique((connection: RedisConnectionConfig) => connection.name)
	@ValidateNested({ each: true })
	@Type(() => RedisConnectionConfig)
	connections!: RedisConnectionConfig[];

}
import type { ConfigurableModuleAsyncOptions, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validate, ValidationError as ClassValidatorValidationError } from 'class-validator';

import { createInstance, StaticFactory } from '../../../../lib/factory/static.factory';
import type { Constructor } from '../../../../lib/mixin/type';

export type ConfigProviderOptions = {
	required?: boolean;
	preserveUnknownFields?: boolean;
};

export type ConfigProviderAsyncOptions<Config extends object> = ConfigurableModuleAsyncOptions<Config>;

export class ConfigProvider {

	static create<Config extends object>(
		configClass: (Constructor<Config> & typeof StaticFactory) | Constructor<Config>,
		configPath: string,
		options: ConfigProviderOptions = {},
	): Provider {
		return {
			provide: configClass,
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => {
				const configObject = configService.get(configPath);
				return this.validate(configClass, configObject, options, `path "${configPath}"`);
			},
		};
	}

	static createAsync<Config extends object>(
		configClass: (Constructor<Config> & typeof StaticFactory) | Constructor<Config>,
		options: ConfigProviderAsyncOptions<Config>,
		configProviderOptions: ConfigProviderOptions = {},
	): Provider {
		return {
			provide: configClass,
			inject: options.inject,
			useFactory: async (...args: unknown[]) => {
				const config = await options.useFactory?.(...args);
				return this.validate(configClass, config, configProviderOptions, 'factory');
			},
		};
	}

	static async validate<Config extends object>(
		configClass: (Constructor<Config> & typeof StaticFactory) | Constructor<Config>,
		configObject: unknown,
		options: ConfigProviderOptions,
		sourceDescription: string,
	): Promise<Config> {
		const required = options.required ?? true;
		const preserveUnknownFields = options.preserveUnknownFields ?? false;

		if (typeof configObject === 'undefined' && required) {
			throw new Error(`[${configClass.name}] Missing config from ${sourceDescription}`);
		}

		const config = isStaticFactoryClass(configClass)
			? configClass.create((configObject ?? {}) as object)
			: createInstance(configClass, (configObject ?? {}) as object);
		const validationErrorList = await validate(config, {
			validationError: { target: true },
			whitelist: !preserveUnknownFields,
		});

		if (validationErrorList.length > 0) {
			const validationErrorMessage = validationErrorList
				.map((error) => formatValidationError(error))
				.join('\n');

			throw new Error(`[${configClass.name}] Invalid config from ${sourceDescription}\n${validationErrorMessage}`);
		}

		return config;
	}

}

function isStaticFactoryClass<Config extends object>(
	configClass: (Constructor<Config> & typeof StaticFactory) | Constructor<Config>,
): configClass is Constructor<Config> & typeof StaticFactory {
	return typeof (configClass as typeof StaticFactory).create === 'function';
}

function formatValidationError(error: ClassValidatorValidationError, parentPath?: string): string {
	const propertyPath = parentPath ? `${parentPath}.${error.property}` : error.property;
	const constraintMessage = Object.values(error.constraints || {}).join(', ');
	const childrenMessage = (error.children || [])
		.map((child) => formatValidationError(child, propertyPath))
		.join('\n');
	const propertyMessage = constraintMessage ? `${propertyPath}: ${constraintMessage}` : undefined;

	return [propertyMessage, childrenMessage]
		.filter((part): part is string => !!part && part.length > 0)
		.join('\n');
}
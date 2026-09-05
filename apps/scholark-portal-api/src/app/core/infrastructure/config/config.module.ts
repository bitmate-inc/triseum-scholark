import {
	DynamicModule,
	Global,
	Module
} from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigModuleOptions } from '@nestjs/config';

import { getEnvFilePath } from '../../../../lib/config/env-file';
import { buildValidationSchema, loadConfigFromDirectory } from '../../../../lib/config/loader/config.loader';

export type AppConfigModuleOptions = Pick<ConfigModuleOptions, 'validate'> & {
	dirPath?: string;
};

@Global()
@Module({})
export class ConfigModule {

	static forRoot(options: AppConfigModuleOptions = {}): DynamicModule {
		const configDefinitionList = options.dirPath
			? loadConfigFromDirectory(options.dirPath)
			: [];

		const configModule = NestConfigModule.forRoot({
			envFilePath: getEnvFilePath(),
			expandVariables: true,
			isGlobal: true,
			load: configDefinitionList.map(({ config }) => config),
			validate: options.validate,
			validationSchema: buildValidationSchema(configDefinitionList),
		});

		return {
			exports: [],
			global: true,
			imports: [configModule],
			module: ConfigModule,
		};
	}

}
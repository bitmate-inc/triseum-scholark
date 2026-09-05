import { Global, Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { Debugger } from 'debug';
import createDebug from 'debug';

import debugConfig from '../../../../config/debug';

export function Debug(): string {
	return 'debug';
}

@Global()
@Module({
	exports: [Debug()],
	providers: [
		{
			inject: [debugConfig.KEY],
			provide: Debug(),
			useFactory: (config: ConfigType<typeof debugConfig>): Debugger =>
				createDebug(config.prefix),
		},
	],
})
export class DebugModule {}
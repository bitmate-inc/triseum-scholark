import { join } from 'node:path';

import {
	DynamicModule,
	Global,
	Module
} from '@nestjs/common';

import { CatalogModule } from './feature/catalog/catalog.module';
import { GameModule } from './feature/game/game.module';
import { TaxonomyModule } from './feature/taxonomy/taxonomy.module';
import { ConfigModule } from './infrastructure/config/config.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { DebugModule } from './infrastructure/debug/debug.module';

@Global()
@Module({})
export class CoreModule {

	static forRoot(): DynamicModule {
		const moduleList = [
			ConfigModule.forRoot({
				dirPath: join(__dirname, '../../config'),
			}),
			DatabaseModule,
			DebugModule,
			TaxonomyModule,
			GameModule,
			CatalogModule,
		];

		return {
			exports: moduleList,
			imports: moduleList,
			module: CoreModule,
		};
	}

}

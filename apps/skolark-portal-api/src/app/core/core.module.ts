import { join } from 'node:path';

import {
	DynamicModule,
	Global,
	Module
} from '@nestjs/common';

import { AccountModule } from './feature/account/account.module';
import { createUserAuthProviderOptions } from './feature/account/auth/user.auth.providers';
import { CatalogModule } from './feature/catalog/catalog.module';
import { GameModule } from './feature/game/game.module';
import { TaxonomyModule } from './feature/taxonomy/taxonomy.module';
import { UserModule } from './feature/user/user.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { ConfigModule } from './infrastructure/config/config.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { DebugModule } from './infrastructure/debug/debug.module';
import { NodemailerModule } from './infrastructure/nodemailer/nodemailer.module';
import { Validator } from './infrastructure/validation/validator/validator';

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
			AccountModule,
			AuthModule.forRoot(createUserAuthProviderOptions(['local'])),
			NodemailerModule,
			TaxonomyModule,
			GameModule,
			CatalogModule,
			UserModule,
		];

		return {
			imports: moduleList,
			module: CoreModule,
			providers: [Validator],
			exports: [...moduleList, Validator],
		};
	}

}

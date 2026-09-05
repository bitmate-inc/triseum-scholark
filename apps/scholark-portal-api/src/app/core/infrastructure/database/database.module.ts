import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import {
	Global,
	Module,
	OnApplicationBootstrap
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import mikroOrmConfig from '../../../../config/mikro-orm';
import { MikroOrmTransactionContext } from '../../../../lib/database/mikro.orm.transaction.context';
import { MikroOrmUnitOfWork } from '../../../../lib/database/mikro.orm.unit.of.work';

@Global()
@Module({
	exports: [MikroOrmTransactionContext, MikroOrmUnitOfWork],
	imports: [
		MikroOrmModule.forRootAsync({
			driver: PostgreSqlDriver,
			inject: [mikroOrmConfig.KEY],
			useFactory: (options: ConfigType<typeof mikroOrmConfig>) => options,
		}),
	],
	providers: [MikroOrmTransactionContext, MikroOrmUnitOfWork],
})
export class DatabaseModule implements OnApplicationBootstrap {

	constructor(private readonly orm: MikroORM) {}

	async onApplicationBootstrap(): Promise<void> {
		await this.orm.connect();
	}

}

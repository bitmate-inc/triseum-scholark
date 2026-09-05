import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
	DynamicModule,
	Module,
	Provider
} from '@nestjs/common';

import { UpdateUserCommand } from './command/update.user.command';
import { User } from './model/user.entity';
import { GetUserQuery } from './query/get.user.query';
import { UserEntityRepository } from './repository/user.entity.repository';

@Module({})
export class UserModule {

	static forRoot(): DynamicModule {
		const providers: Provider[] = [
			UserEntityRepository,
			GetUserQuery,
			UpdateUserCommand,
		];

		return {
			exports: providers,
			global: true,
			imports: [MikroOrmModule.forFeature([User])],
			module: UserModule,
			providers,
		};
	}

}

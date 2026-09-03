import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { UpdateUserCommand } from './command/update.user.command';
import { User } from './model/user.entity';
import { GetUserQuery } from './query/get.user.query';
import { UserRepository } from './repository/user.repository';

const providerList = [
	GetUserQuery,
	UpdateUserCommand,
	UserRepository,
];

@Global()
@Module({
	exports: providerList,
	imports: [MikroOrmModule.forFeature([User])],
	providers: providerList,
})
export class UserModule {}

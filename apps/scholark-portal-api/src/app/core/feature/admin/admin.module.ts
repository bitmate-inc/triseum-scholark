import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { AdminUser } from './model/admin.user.entity';
import { AdminUserRepository } from './repository/admin.user.repository';

@Global()
@Module({
	exports: [AdminUserRepository, MikroOrmModule],
	imports: [MikroOrmModule.forFeature([AdminUser])],
	providers: [AdminUserRepository],
})
export class AdminFeatureModule {}
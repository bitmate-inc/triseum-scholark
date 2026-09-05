import { Module } from '@nestjs/common';

import { CoreModule } from '../core/core.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';

@Module({
	imports: [CoreModule.forRoot(), AuthModule, CatalogModule, HealthModule, UserModule],
})
export class WwwModule {}
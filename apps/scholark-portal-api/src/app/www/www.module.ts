import { Module } from '@nestjs/common';

import { CoreModule } from '../core/core.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { GameApiModule } from './game/game-api.module';
import { HealthModule } from './health/health.module';
import { InstructorModule } from './instructor/instructor.module';
import { PublisherModule } from './publisher/publisher.module';
import { UserModule } from './user/user.module';

@Module({
	imports: [CoreModule.forRoot(), AdminModule, AuthModule, CatalogModule, GameApiModule, HealthModule, InstructorModule, PublisherModule, UserModule],
})
export class WwwModule {}
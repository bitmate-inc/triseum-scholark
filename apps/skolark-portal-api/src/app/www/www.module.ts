import { Module } from '@nestjs/common';

import { CoreModule } from '../core/core.module';
import { CatalogModule } from './catalog/catalog.module';
import { HealthModule } from './health/health.module';

@Module({
	imports: [CoreModule.forRoot(), CatalogModule, HealthModule],
})
export class WwwModule {}
import { Module } from '@nestjs/common';

import { ConfigModule } from '../core/infrastructure/config/config.module';
import { ExportEnvironmentCli } from './environment/export.environment.cli';

@Module({
	imports: [ConfigModule.forRoot()],
	providers: [ExportEnvironmentCli],
})
export class CliModule {
}
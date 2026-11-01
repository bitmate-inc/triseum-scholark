import { Module } from '@nestjs/common';

import { SessionAuthGuard } from '../auth/session.auth.guard';
import { PublisherAuthGuard } from './publisher.auth.guard';
import { PublisherController } from './publisher.controller';

@Module({
	controllers: [PublisherController],
	providers: [PublisherAuthGuard, SessionAuthGuard],
})
export class PublisherModule {}
import { Module } from '@nestjs/common';

import { ClassroomController } from './classroom.controller';
import { ClassroomGameController } from './classroom-game.controller';
import { CourseController } from './course.controller';
import { GameController } from './game.controller';
import { InstitutionController } from './institution.controller';
import { StripeWebhookController } from './stripe.webhook.controller';

@Module({
	controllers: [
		GameController,
		InstitutionController,
		CourseController,
		ClassroomController,
		ClassroomGameController,
		StripeWebhookController,
	],
})
export class CatalogModule {}
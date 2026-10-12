import { Module } from '@nestjs/common';

import { ClassroomController } from './classroom.controller';
import { ClassroomGameListingController } from './classroom-game-listing.controller';
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
		ClassroomGameListingController,
		StripeWebhookController,
	],
})
export class CatalogModule {}
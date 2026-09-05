import { Module } from '@nestjs/common';

import { ClassroomController } from './classroom.controller';
import { ClassroomGameController } from './classroom-game.controller';
import { CourseController } from './course.controller';
import { GameController } from './game.controller';
import { InstitutionController } from './institution.controller';

@Module({
	controllers: [
		GameController,
		InstitutionController,
		CourseController,
		ClassroomController,
		ClassroomGameController,
	],
})
export class CatalogModule {}
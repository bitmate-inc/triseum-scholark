import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { GameModule } from '../game/game.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { Classroom } from './model/classroom.entity';
import { ClassroomGame } from './model/classroom.game.entity';
import { Course } from './model/course.entity';
import { EducationalInstitution } from './model/educational.institution.entity';

@Global()
@Module({
	exports: [MikroOrmModule],
	imports: [
		MikroOrmModule.forFeature([
			EducationalInstitution,
			Course,
			Classroom,
			ClassroomGame,
		]),
		GameModule,
		TaxonomyModule,
	],
})
export class EducationModule {}
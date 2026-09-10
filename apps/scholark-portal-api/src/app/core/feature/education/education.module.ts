import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { GameModule } from '../game/game.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { Classroom } from './model/classroom.entity';
import { ClassroomGame } from './model/classroom.game.entity';
import { ClassroomGameLicence } from './model/classroom.game.licence.entity';
import { ContractGame } from './model/contract.game.entity';
import { Course } from './model/course.entity';
import { EducationalInstitution } from './model/educational.institution.entity';
import { InstitutionContract } from './model/institution.contract.entity';
import { Instructor } from './model/instructor.entity';

@Global()
@Module({
	exports: [MikroOrmModule],
	imports: [
		MikroOrmModule.forFeature([
			EducationalInstitution,
			Course,
			Classroom,
			ClassroomGame,
			ClassroomGameLicence,
			ContractGame,
			Instructor,
			InstitutionContract,
		]),
		GameModule,
		TaxonomyModule,
	],
})
export class EducationModule {}
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { AcquireClassroomGameCommand } from '../game/command/acquire.classroom.game.command';
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
import { ClassroomGameLicenceRepository } from './repository/classroom.game.licence.repository';
import { ClassroomGameRepository } from './repository/classroom.game.repository';
import { ContractGameRepository } from './repository/contract.game.repository';

@Global()
@Module({
	exports: [
		AcquireClassroomGameCommand,
		ClassroomGameLicenceRepository,
		ClassroomGameRepository,
		ContractGameRepository,
		MikroOrmModule,
	],
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
	providers: [
		AcquireClassroomGameCommand,
		ClassroomGameLicenceRepository,
		ClassroomGameRepository,
		ContractGameRepository,
	],
})
export class EducationModule {}
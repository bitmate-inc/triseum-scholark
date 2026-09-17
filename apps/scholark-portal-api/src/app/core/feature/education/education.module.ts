import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { AcquireClassroomGameCommand } from '../game/command/acquire.classroom.game.command';
import { GameModule } from '../game/game.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { Classroom } from './model/classroom.entity';
import { ClassroomGame } from './model/classroom.game.entity';
import { ClassroomGameLicence } from './model/classroom.game.licence.entity';
import { InstitutionContractGameVersion } from './model/institution.contract.game.version.entity';
import { Course } from './model/course.entity';
import { Institution } from './model/institution.entity';
import { InstitutionContract } from './model/institution.contract.entity';
import { Instructor } from './model/instructor.entity';
import { ClassroomGameLicenceRepository } from './repository/classroom.game.licence.repository';
import { ClassroomGameRepository } from './repository/classroom.game.repository';
import { InstitutionContractGameVersionRepository } from './repository/institution.contract.game.version.repository';

@Global()
@Module({
	exports: [
		AcquireClassroomGameCommand,
		ClassroomGameLicenceRepository,
		ClassroomGameRepository,
		InstitutionContractGameVersionRepository,
		MikroOrmModule,
	],
	imports: [
		MikroOrmModule.forFeature([
			Institution,
			Course,
			Classroom,
			ClassroomGame,
			ClassroomGameLicence,
			InstitutionContractGameVersion,
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
		InstitutionContractGameVersionRepository,
	],
})
export class EducationModule {}
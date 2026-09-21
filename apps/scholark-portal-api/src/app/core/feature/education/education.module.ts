import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { AcquireClassroomGameCommand } from '../game/command/acquire.classroom.game.command';
import { GameModule } from '../game/game.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { Classroom } from './model/classroom.entity';
import { ClassroomGame } from './model/classroom.game.entity';
import { Course } from './model/course.entity';
import { InstitutionContract } from './model/institution.contract.entity';
import { InstitutionContractGameOffer } from './model/institution.contract.game.offer.entity';
import { Institution } from './model/institution.entity';
import { Instructor } from './model/instructor.entity';
import { ClassroomGameRepository } from './repository/classroom.game.repository';
import { InstitutionContractGameOfferRepository } from './repository/institution.contract.game.offer.repository';

@Global()
@Module({
	exports: [
		AcquireClassroomGameCommand,
		ClassroomGameRepository,
		InstitutionContractGameOfferRepository,
		MikroOrmModule,
	],
	imports: [
		MikroOrmModule.forFeature([
			Institution,
			Course,
			Classroom,
			ClassroomGame,
			InstitutionContractGameOffer,
			Instructor,
			InstitutionContract,
		]),
		GameModule,
		TaxonomyModule,
	],
	providers: [
		AcquireClassroomGameCommand,
		ClassroomGameRepository,
		InstitutionContractGameOfferRepository,
	],
})
export class EducationModule {}
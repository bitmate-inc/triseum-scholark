import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { AcquireClassroomGameCommand } from '../game/command/acquire.classroom.game.command';
import { RedeemAcquisitionCodeCommand } from '../game/command/redeem.acquisition.code.command';
import { GameModule } from '../game/game.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { AcquisitionCode } from './model/acquisition.code.entity';
import { AcquisitionCodeRedemption } from './model/acquisition.code.redemption.entity';
import { Classroom } from './model/classroom.entity';
import { ClassroomGame } from './model/classroom.game.entity';
import { Course } from './model/course.entity';
import { Institution } from './model/institution.entity';
import { InstitutionGameOffer } from './model/institution.game.offer.entity';
import { Instructor } from './model/instructor.entity';
import { AcquisitionCodeRepository } from './repository/acquisition.code.repository';
import { ClassroomGameRepository } from './repository/classroom.game.repository';
import { InstitutionGameOfferRepository } from './repository/institution.game.offer.repository';

@Global()
@Module({
	exports: [
		AcquireClassroomGameCommand,
		RedeemAcquisitionCodeCommand,
		ClassroomGameRepository,
		AcquisitionCodeRepository,
		InstitutionGameOfferRepository,
		MikroOrmModule,
	],
	imports: [
		MikroOrmModule.forFeature([
			Institution,
			Course,
			Classroom,
			ClassroomGame,
			InstitutionGameOffer,
			Instructor,
			AcquisitionCode,
			AcquisitionCodeRedemption,
		]),
		GameModule,
		TaxonomyModule,
	],
	providers: [
		AcquireClassroomGameCommand,
		RedeemAcquisitionCodeCommand,
		ClassroomGameRepository,
		AcquisitionCodeRepository,
		InstitutionGameOfferRepository,
	],
})
export class EducationModule {}
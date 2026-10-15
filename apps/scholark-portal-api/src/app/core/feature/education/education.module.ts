import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { AcquireClassroomGameListingCommand } from '../game/command/acquire.classroom.game.listing.command';
import { RedeemAcquisitionCodeCommand } from '../game/command/redeem.acquisition.code.command';
import { GameModule } from '../game/game.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { AcceptInstructorInvitationCommand } from './command/accept.instructor.invitation.command';
import { CreateInstructorInvitationCommand } from './command/create.instructor.invitation.command';
import { AcquisitionCode } from './model/acquisition.code.entity';
import { AcquisitionCodeRedemption } from './model/acquisition.code.redemption.entity';
import { Classroom } from './model/classroom.entity';
import { ClassroomGameListing } from './model/classroom.game.listing.entity';
import { Course } from './model/course.entity';
import { Institution } from './model/institution.entity';
import { Instructor } from './model/instructor.entity';
import { InstructorInvitation } from './model/instructor.invitation.entity';
import { InstructorUser } from './model/instructor.user.entity';
import { GetInstructorInvitationQuery } from './query/get.instructor.invitation.query';
import {
	GetInstructorClassroomListQuery,
	GetInstructorClassroomQuery,
	GetInstructorProfileQuery,
} from './query/get.instructor.portal.query';
import { AcquisitionCodeRepository } from './repository/acquisition.code.repository';
import { ClassroomGameListingRepository } from './repository/classroom.game.listing.repository';
import { ClassroomRepository } from './repository/classroom.repository';
import { CourseRepository } from './repository/course.repository';
import { InstitutionRepository } from './repository/institution.repository';
import { InstructorRepository } from './repository/instructor.repository';
import { InstructorUserRepository } from './repository/instructor.user.repository';

@Global()
@Module({
	exports: [
		AcquireClassroomGameListingCommand,
		RedeemAcquisitionCodeCommand,
		ClassroomGameListingRepository,
		AcquisitionCodeRepository,
		ClassroomRepository,
		CourseRepository,
		InstitutionRepository,
		InstructorRepository,
		InstructorUserRepository,
		GetInstructorClassroomListQuery,
		GetInstructorClassroomQuery,
		GetInstructorProfileQuery,
		GetInstructorInvitationQuery,
		CreateInstructorInvitationCommand,
		AcceptInstructorInvitationCommand,
		MikroOrmModule,
	],
	imports: [
		MikroOrmModule.forFeature([
			Institution,
			Course,
			Classroom,
			ClassroomGameListing,
			Instructor,
			InstructorInvitation,
			InstructorUser,
			AcquisitionCode,
			AcquisitionCodeRedemption,
		]),
		GameModule,
		TaxonomyModule,
	],
	providers: [
		AcquireClassroomGameListingCommand,
		RedeemAcquisitionCodeCommand,
		ClassroomGameListingRepository,
		AcquisitionCodeRepository,
		ClassroomRepository,
		CourseRepository,
		InstitutionRepository,
		InstructorRepository,
		InstructorUserRepository,
		GetInstructorClassroomListQuery,
		GetInstructorClassroomQuery,
		GetInstructorProfileQuery,
		GetInstructorInvitationQuery,
		CreateInstructorInvitationCommand,
		AcceptInstructorInvitationCommand,
	],
})
export class EducationModule {}
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { AcquisitionCode } from '../education/model/acquisition.code.entity';
import { AcquisitionCodeRedemption } from '../education/model/acquisition.code.redemption.entity';
import { Classroom } from '../education/model/classroom.entity';
import { ClassroomGame } from '../education/model/classroom.game.entity';
import { Course } from '../education/model/course.entity';
import { Institution } from '../education/model/institution.entity';
import { InstitutionGameOffer } from '../education/model/institution.game.offer.entity';
import { Instructor } from '../education/model/instructor.entity';
import { GameAcquisition } from '../game/model/game.acquisition.entity';
import { Game } from '../game/model/game.entity';
import { GameLicense } from '../game/model/game.license.entity';
import { GamePaymentAttempt } from '../game/model/game.payment.attempt.entity';
import { GameVariant } from '../game/model/game.variant.entity';
import { GameVersion } from '../game/model/game.version.entity';
import { PublicGameOffer } from '../game/model/public.game.offer.entity';
import { Publisher } from '../publisher/model/publisher.entity';
import { TaxonomyTerm } from '../taxonomy/model/taxonomy.term.entity';
import { User } from '../user/model/user.entity';
import { CreateAdminAcquisitionCodesCommand } from './command/create.admin.acquisition.codes.command';
import { CreateAdminClassroomCommand } from './command/create.admin.classroom.command';
import { CreateAdminClassroomGameCommand } from './command/create.admin.classroom.game.command';
import { CreateAdminCourseCommand } from './command/create.admin.course.command';
import { CreateAdminGameCommand } from './command/create.admin.game.command';
import { CreateAdminGameOfferCommand } from './command/create.admin.game.offer.command';
import { CreateAdminGameVersionCommand } from './command/create.admin.game.version.command';
import { CreateAdminInstitutionCommand } from './command/create.admin.institution.command';
import { CreateAdminInstructorCommand } from './command/create.admin.instructor.command';
import { CreateAdminPublisherCommand } from './command/create.admin.publisher.command';
import { CreateAdminTaxonomyTermCommand } from './command/create.admin.taxonomy.term.command';
import { RevokeAdminAcquisitionCodeCommand } from './command/revoke.admin.acquisition.code.command';
import { UpdateAdminClassroomCommand } from './command/update.admin.classroom.command';
import { UpdateAdminClassroomGameCommand } from './command/update.admin.classroom.game.command';
import { UpdateAdminCourseCommand } from './command/update.admin.course.command';
import { UpdateAdminGameCommand } from './command/update.admin.game.command';
import { UpdateAdminGameVersionCommand } from './command/update.admin.game.version.command';
import { UpdateAdminInstitutionCommand } from './command/update.admin.institution.command';
import { UpdateAdminInstitutionGameOfferCommand } from './command/update.admin.institution.game.offer.command';
import { UpdateAdminInstructorCommand } from './command/update.admin.instructor.command';
import { UpdateAdminPublicGameOfferCommand } from './command/update.admin.public.game.offer.command';
import { UpdateAdminPublisherCommand } from './command/update.admin.publisher.command';
import { UpdateAdminTaxonomyTermCommand } from './command/update.admin.taxonomy.term.command';
import { AdminUser } from './model/admin.user.entity';
import { GetAdminAcquisitionCodeListQuery } from './query/get.admin.acquisition.code.list.query';
import {
	GetAdminAcquisitionListQuery,
	GetAdminLicenseListQuery,
	GetAdminPaymentAttemptListQuery
} from './query/get.admin.billing.query';
import { GetAdminClassroomGameListQuery, GetAdminClassroomGameQuery } from './query/get.admin.classroom.game.query';
import { GetAdminClassroomListQuery } from './query/get.admin.classroom.list.query';
import { GetAdminGameOfferListQuery } from './query/get.admin.game.offer.query';
import { GetAdminGameListQuery, GetAdminGameQuery } from './query/get.admin.game.query';
import { GetAdminInstructorListQuery, GetAdminInstructorQuery } from './query/get.admin.instructor.query';
import { GetAdminPublisherListQuery, GetAdminPublisherQuery } from './query/get.admin.publisher.query';
import { GetAdminTaxonomyTermListQuery } from './query/get.admin.taxonomy.term.query';
import { GetAdminUserListQuery } from './query/get.admin.user.list.query';
import { AdminUserRepository } from './repository/admin.user.repository';

@Global()
@Module({
	exports: [AdminUserRepository, CreateAdminAcquisitionCodesCommand, RevokeAdminAcquisitionCodeCommand, CreateAdminClassroomCommand, CreateAdminClassroomGameCommand, CreateAdminCourseCommand, CreateAdminGameCommand, CreateAdminGameOfferCommand, CreateAdminGameVersionCommand, CreateAdminInstitutionCommand, CreateAdminInstructorCommand, CreateAdminPublisherCommand, CreateAdminTaxonomyTermCommand, GetAdminAcquisitionCodeListQuery, GetAdminAcquisitionListQuery, GetAdminClassroomGameListQuery, GetAdminClassroomGameQuery, GetAdminClassroomListQuery, GetAdminGameListQuery, GetAdminGameOfferListQuery, GetAdminGameQuery, GetAdminInstructorListQuery, GetAdminInstructorQuery, GetAdminLicenseListQuery, GetAdminPaymentAttemptListQuery, GetAdminPublisherListQuery, GetAdminPublisherQuery, GetAdminTaxonomyTermListQuery, GetAdminUserListQuery, MikroOrmModule, UpdateAdminClassroomCommand, UpdateAdminClassroomGameCommand, UpdateAdminCourseCommand, UpdateAdminGameCommand, UpdateAdminGameVersionCommand, UpdateAdminInstitutionCommand, UpdateAdminInstitutionGameOfferCommand, UpdateAdminInstructorCommand, UpdateAdminPublisherCommand, UpdateAdminPublicGameOfferCommand, UpdateAdminTaxonomyTermCommand],
	imports: [MikroOrmModule.forFeature([AcquisitionCode, AcquisitionCodeRedemption, AdminUser, Classroom, ClassroomGame, Course, Game, GameAcquisition, GameLicense, GamePaymentAttempt, GameVariant, GameVersion, Institution, InstitutionGameOffer, Instructor, PublicGameOffer, Publisher, TaxonomyTerm, User])],
	providers: [AdminUserRepository, CreateAdminAcquisitionCodesCommand, RevokeAdminAcquisitionCodeCommand, CreateAdminClassroomCommand, CreateAdminClassroomGameCommand, CreateAdminCourseCommand, CreateAdminGameCommand, CreateAdminGameOfferCommand, CreateAdminGameVersionCommand, CreateAdminInstitutionCommand, CreateAdminInstructorCommand, CreateAdminPublisherCommand, CreateAdminTaxonomyTermCommand, GetAdminAcquisitionCodeListQuery, GetAdminAcquisitionListQuery, GetAdminClassroomGameListQuery, GetAdminClassroomGameQuery, GetAdminClassroomListQuery, GetAdminGameListQuery, GetAdminGameOfferListQuery, GetAdminGameQuery, GetAdminInstructorListQuery, GetAdminInstructorQuery, GetAdminLicenseListQuery, GetAdminPaymentAttemptListQuery, GetAdminPublisherListQuery, GetAdminPublisherQuery, GetAdminTaxonomyTermListQuery, GetAdminUserListQuery, UpdateAdminClassroomCommand, UpdateAdminClassroomGameCommand, UpdateAdminCourseCommand, UpdateAdminGameCommand, UpdateAdminGameVersionCommand, UpdateAdminInstitutionCommand, UpdateAdminInstitutionGameOfferCommand, UpdateAdminInstructorCommand, UpdateAdminPublisherCommand, UpdateAdminPublicGameOfferCommand, UpdateAdminTaxonomyTermCommand],
})
export class AdminFeatureModule {}
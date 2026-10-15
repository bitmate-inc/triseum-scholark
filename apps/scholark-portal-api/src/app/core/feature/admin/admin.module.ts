import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { EducationModule } from '../education/education.module';
import { AcquisitionCode } from '../education/model/acquisition.code.entity';
import { AcquisitionCodeRedemption } from '../education/model/acquisition.code.redemption.entity';
import { Classroom } from '../education/model/classroom.entity';
import { ClassroomGameListing } from '../education/model/classroom.game.listing.entity';
import { Course } from '../education/model/course.entity';
import { Institution } from '../education/model/institution.entity';
import { Instructor } from '../education/model/instructor.entity';
import { GameModule } from '../game/game.module';
import { GameAcquisition } from '../game/model/game.acquisition.entity';
import { Game } from '../game/model/game.entity';
import { GameLicense } from '../game/model/game.license.entity';
import { GamePaymentAttempt } from '../game/model/game.payment.attempt.entity';
import { GameVersion } from '../game/model/game.version.entity';
import { PublicGameListing } from '../game/model/public.game.listing.entity';
import { PublicGameListingPriceGroup } from '../game/model/public.game.listing.price.group.entity';
import { PublicGameListingPriceGroupLanguage } from '../game/model/public.game.listing.price.group.language.entity';
import { Publisher } from '../publisher/model/publisher.entity';
import { PublisherRepository } from '../publisher/repository/publisher.repository';
import { TaxonomyTerm } from '../taxonomy/model/taxonomy.term.entity';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { User } from '../user/model/user.entity';
import { CreateAdminAcquisitionCodesCommand } from './command/create.admin.acquisition.codes.command';
import { CreateAdminClassroomCommand } from './command/create.admin.classroom.command';
import { CreateAdminClassroomGameListingCommand } from './command/create.admin.classroom.game.listing.command';
import { CreateAdminCourseCommand } from './command/create.admin.course.command';
import { CreateAdminGameCommand } from './command/create.admin.game.command';
import { CreateAdminGameListingCommand } from './command/create.admin.game.listing.command';
import { CreateAdminGameVersionCommand } from './command/create.admin.game.version.command';
import { CreateAdminInstitutionCommand } from './command/create.admin.institution.command';
import { CreateAdminInstructorCommand } from './command/create.admin.instructor.command';
import { CreateAdminPublisherCommand } from './command/create.admin.publisher.command';
import { CreateAdminTaxonomyTermCommand } from './command/create.admin.taxonomy.term.command';
import { LinkAdminInstructorAccountCommand } from './command/link.admin.instructor.account.command';
import { RevokeAdminAcquisitionCodeCommand } from './command/revoke.admin.acquisition.code.command';
import { UpdateAdminClassroomCommand } from './command/update.admin.classroom.command';
import { UpdateAdminClassroomGameListingCommand } from './command/update.admin.classroom.game.listing.command';
import { UpdateAdminCourseCommand } from './command/update.admin.course.command';
import { UpdateAdminGameCommand } from './command/update.admin.game.command';
import { UpdateAdminGameVersionCommand } from './command/update.admin.game.version.command';
import { UpdateAdminInstitutionCommand } from './command/update.admin.institution.command';
import { UpdateAdminInstructorCommand } from './command/update.admin.instructor.command';
import { UpdateAdminPublicGameListingCommand } from './command/update.admin.public.game.listing.command';
import { UpdateAdminPublisherCommand } from './command/update.admin.publisher.command';
import { UpdateAdminTaxonomyTermCommand } from './command/update.admin.taxonomy.term.command';
import { AdminUser } from './model/admin.user.entity';
import { GetAdminAcquisitionCodeListQuery } from './query/get.admin.acquisition.code.list.query';
import {
	GetAdminAcquisitionListQuery,
	GetAdminLicenseListQuery,
	GetAdminPaymentAttemptListQuery
} from './query/get.admin.billing.query';
import { GetAdminClassroomGameListingListQuery, GetAdminClassroomGameListingQuery } from './query/get.admin.classroom.game.listing.query';
import { GetAdminClassroomListQuery } from './query/get.admin.classroom.list.query';
import { GetAdminGameListingListQuery } from './query/get.admin.game.listing.query';
import { GetAdminGameListQuery, GetAdminGameQuery } from './query/get.admin.game.query';
import { GetAdminInstructorListQuery, GetAdminInstructorQuery } from './query/get.admin.instructor.query';
import { GetAdminPublisherListQuery, GetAdminPublisherQuery } from './query/get.admin.publisher.query';
import { GetAdminTaxonomyTermListQuery } from './query/get.admin.taxonomy.term.query';
import { GetAdminUserListQuery } from './query/get.admin.user.list.query';
import { AdminUserRepository } from './repository/admin.user.repository';

@Global()
@Module({
	exports: [AdminUserRepository, CreateAdminAcquisitionCodesCommand, RevokeAdminAcquisitionCodeCommand, CreateAdminClassroomCommand, CreateAdminClassroomGameListingCommand, CreateAdminCourseCommand, CreateAdminGameCommand, CreateAdminGameListingCommand, CreateAdminGameVersionCommand, CreateAdminInstitutionCommand, CreateAdminInstructorCommand, LinkAdminInstructorAccountCommand, CreateAdminPublisherCommand, CreateAdminTaxonomyTermCommand, GetAdminAcquisitionCodeListQuery, GetAdminAcquisitionListQuery, GetAdminClassroomGameListingListQuery, GetAdminClassroomGameListingQuery, GetAdminClassroomListQuery, GetAdminGameListQuery, GetAdminGameListingListQuery, GetAdminGameQuery, GetAdminInstructorListQuery, GetAdminInstructorQuery, GetAdminLicenseListQuery, GetAdminPaymentAttemptListQuery, GetAdminPublisherListQuery, GetAdminPublisherQuery, GetAdminTaxonomyTermListQuery, GetAdminUserListQuery, MikroOrmModule, UpdateAdminClassroomCommand, UpdateAdminClassroomGameListingCommand, UpdateAdminCourseCommand, UpdateAdminGameCommand, UpdateAdminGameVersionCommand, UpdateAdminInstitutionCommand, UpdateAdminInstructorCommand, UpdateAdminPublisherCommand, UpdateAdminPublicGameListingCommand, UpdateAdminTaxonomyTermCommand],
	imports: [EducationModule, GameModule, MikroOrmModule.forFeature([AcquisitionCode, AcquisitionCodeRedemption, AdminUser, Classroom, ClassroomGameListing, Course, Game, GameAcquisition, GameLicense, GamePaymentAttempt, GameVersion, Institution, Instructor, PublicGameListing, PublicGameListingPriceGroup, PublicGameListingPriceGroupLanguage, Publisher, TaxonomyTerm, User]), TaxonomyModule],
	providers: [AdminUserRepository, PublisherRepository, CreateAdminAcquisitionCodesCommand, RevokeAdminAcquisitionCodeCommand, CreateAdminClassroomCommand, CreateAdminClassroomGameListingCommand, CreateAdminCourseCommand, CreateAdminGameCommand, CreateAdminGameListingCommand, CreateAdminGameVersionCommand, CreateAdminInstitutionCommand, CreateAdminInstructorCommand, LinkAdminInstructorAccountCommand, CreateAdminPublisherCommand, CreateAdminTaxonomyTermCommand, GetAdminAcquisitionCodeListQuery, GetAdminAcquisitionListQuery, GetAdminClassroomGameListingListQuery, GetAdminClassroomGameListingQuery, GetAdminClassroomListQuery, GetAdminGameListQuery, GetAdminGameListingListQuery, GetAdminGameQuery, GetAdminInstructorListQuery, GetAdminInstructorQuery, GetAdminLicenseListQuery, GetAdminPaymentAttemptListQuery, GetAdminPublisherListQuery, GetAdminPublisherQuery, GetAdminTaxonomyTermListQuery, GetAdminUserListQuery, UpdateAdminClassroomCommand, UpdateAdminClassroomGameListingCommand, UpdateAdminCourseCommand, UpdateAdminGameCommand, UpdateAdminGameVersionCommand, UpdateAdminInstitutionCommand, UpdateAdminInstructorCommand, UpdateAdminPublisherCommand, UpdateAdminPublicGameListingCommand, UpdateAdminTaxonomyTermCommand],
})
export class AdminFeatureModule {}
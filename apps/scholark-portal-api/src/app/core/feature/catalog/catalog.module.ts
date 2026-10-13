import { Global, Module } from '@nestjs/common';

import { EducationModule } from '../education/education.module';
import { GameModule } from '../game/game.module';
import { GetCatalogClassroomListQuery, GetCatalogClassroomQuery } from './query/get.catalog.classroom.query';
import { GetCatalogClassroomGameListingListQuery, GetCatalogClassroomGameListingQuery } from './query/get.catalog.classroom-game-listing.query';
import { GetCatalogCourseListQuery, GetCatalogCourseQuery } from './query/get.catalog.course.query';
import { GetCatalogGameListQuery } from './query/get.catalog.game.list.query';
import { GetCatalogInstitutionListQuery, GetCatalogInstitutionQuery } from './query/get.catalog.institution.query';
import { GetFeaturedGameListQuery } from './query/get.featured.game.list.query';
import { GetGameQuery } from './query/get.game.query';
import { GetUserLibraryQuery } from './query/get.user.library.query';

const educationCatalogQueryList = [
	GetCatalogInstitutionListQuery,
	GetCatalogInstitutionQuery,
	GetCatalogCourseListQuery,
	GetCatalogCourseQuery,
	GetCatalogClassroomListQuery,
	GetCatalogClassroomQuery,
	GetCatalogClassroomGameListingListQuery,
	GetCatalogClassroomGameListingQuery,
];

@Global()
@Module({
	exports: [
		GetCatalogGameListQuery,
		GetFeaturedGameListQuery,
		GetGameQuery,
		GetUserLibraryQuery,
		...educationCatalogQueryList,
	],
	imports: [EducationModule, GameModule],
	providers: [
		GetCatalogGameListQuery,
		GetFeaturedGameListQuery,
		GetGameQuery,
		GetUserLibraryQuery,
		...educationCatalogQueryList,
	],
})
export class CatalogModule {}

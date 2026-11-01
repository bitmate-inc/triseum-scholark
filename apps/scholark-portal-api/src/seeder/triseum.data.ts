import { ClassroomGameListingDesignatedPayor } from '../app/core/feature/education/model/classroom.game.listing.entity';
import { EducationCatalogStatus } from '../app/core/feature/education/model/education.catalog.status';
import { TaxonomyType } from '../app/core/feature/taxonomy/model/taxonomy.term.entity';
import type {
	AcquisitionCodeSeed,
	ClassroomGameGradingRuleSeed,
	ClassroomGameListingSeed,
	ClassroomSeed,
	CourseSeed,
	GameCustomizationSeed,
	GameProgressSnapshotSeed,
	GameSeed,
	GameVersionSeed,
	InstitutionSeed,
	InstructorSeed,
	PublicListingSeed,
	PublisherMemberSeed,
	PublisherSeed,
	UserGameLicenseSeed,
} from './catalog.data';
import {
	gameSeedList,
	gameVersionSeedList,
	instructorSeedList,
	publicListingSeedList,
	publisherMemberSeedList,
	publisherSeedList,
} from './catalog.data';
import { userSeedList } from './user.data';

export interface CatalogSeedData {
	acquisitionCodeSeedList: AcquisitionCodeSeed[];
	classroomGameGradingRuleSeedList: ClassroomGameGradingRuleSeed[];
	classroomGameListingSeedList: ClassroomGameListingSeed[];
	classroomSeedList: ClassroomSeed[];
	courseSeedList: CourseSeed[];
	gameCustomizationSeedList: GameCustomizationSeed[];
	gameProgressSnapshotSeedList: GameProgressSnapshotSeed[];
	gameSeedList: GameSeed[];
	gameVersionSeedList: GameVersionSeed[];
	institutionSeedList: InstitutionSeed[];
	instructorSeedList: InstructorSeed[];
	publicListingSeedList: PublicListingSeed[];
	publisherMemberSeedList: PublisherMemberSeed[];
	publisherSeedList: PublisherSeed[];
	userGameLicenseSeedList: UserGameLicenseSeed[];
}

const arteMecenasGameSeed = gameSeedList.find(({ slug }) => slug === 'arte-mecenas')!;

const triseumAdditionalGameSeedList: GameSeed[] = [
	{
		id: '00000000-0000-4000-8000-000000000008',
		slug: 'arte-lumiere',
		title: 'ARTé: Lumière',
		summary: 'Explore 19th-century Paris and the birth of Impressionism through art and society.',
		description: 'As an art collector in Paris, discover the connections between art and society during a rapidly changing era. Explore the transition from traditional Salons to exhibitions and the artists who transformed modern art.',
		cover: {
			type: 'image',
			src: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1800&q=85',
			alt: 'ARTé: Lumière key art',
		},
		publisherSlugList: ['triseum'],
		taxonomyList: arteMecenasGameSeed.taxonomyList,
		estimatedLengthMinutesMin: 120,
		estimatedLengthMinutesMax: 180,
		isFeatured: false,
		publishedAt: new Date('2026-01-08T00:00:00.000Z'),
		mediaList: [],
	},
	{
		id: '00000000-0000-4000-8000-000000000009',
		slug: 'arte-hemut',
		title: 'ARTé: Hemut',
		summary: 'An ARTé game from Triseum for art history and appreciation courses.',
		description: 'An interactive game-based learning experience from Triseum’s ARTé collection.',
		cover: {
			type: 'image',
			src: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1800&q=85',
			alt: 'ARTé: Hemut key art',
		},
		publisherSlugList: ['triseum'],
		taxonomyList: arteMecenasGameSeed.taxonomyList,
		estimatedLengthMinutesMin: 120,
		estimatedLengthMinutesMax: 180,
		isFeatured: false,
		publishedAt: new Date('2026-01-09T00:00:00.000Z'),
		mediaList: [],
	},
];

const triseumGameSeedList: GameSeed[] = [arteMecenasGameSeed, ...triseumAdditionalGameSeedList];

const triseumGameVersionSeedList: GameVersionSeed[] = [
	...gameVersionSeedList.filter(({ gameSlug }) => gameSlug === 'arte-mecenas'),
	{
		id: '00000000-0000-4000-8000-000000000315',
		gameSlug: 'arte-lumiere',
		description: 'The initial published build of ARTé: Lumière.',
		publisherVersion: '1.0.0',
		publishedAt: new Date('2026-01-08T00:00:00.000Z'),
		runUrl: 'https://play.triseum.com/arte-lumiere',
	},
	{
		id: '00000000-0000-4000-8000-000000000316',
		gameSlug: 'arte-hemut',
		description: 'The initial published build of ARTé: Hemut.',
		publisherVersion: '1.0.0',
		publishedAt: new Date('2026-01-09T00:00:00.000Z'),
		runUrl: 'https://play.triseum.com/arte-hemut',
	},
];

export const triseumCatalogUserSeedList = userSeedList.filter(
	({ email }) => email === 'user1@scholark.com',
);

export const triseumClassroomUserSeedList = userSeedList.filter(
	({ email }) => ['user1@scholark.com', 'user2@scholark.com'].includes(email),
);

const emptyCatalogSeedData: CatalogSeedData = {
	acquisitionCodeSeedList: [],
	classroomGameGradingRuleSeedList: [],
	classroomGameListingSeedList: [],
	classroomSeedList: [],
	courseSeedList: [],
	gameCustomizationSeedList: [],
	gameProgressSnapshotSeedList: [],
	gameSeedList: [],
	gameVersionSeedList: [],
	institutionSeedList: [],
	instructorSeedList: [],
	publicListingSeedList: [],
	publisherMemberSeedList: [],
	publisherSeedList: [],
	userGameLicenseSeedList: [],
};

export const triseumCatalogSeedData: CatalogSeedData = {
	...emptyCatalogSeedData,
	gameSeedList: triseumGameSeedList,
	gameVersionSeedList: triseumGameVersionSeedList,
	publisherMemberSeedList: publisherMemberSeedList.filter(({ publisherSlug }) => publisherSlug === 'triseum'),
	publisherSeedList: publisherSeedList.filter(({ slug }) => slug === 'triseum'),
};

const triseumDemoInstitutionSlug = 'triseum-demo-institution';
const triseumDemoCourseSlug = 'triseum-demo-course';
const triseumDemoClassroomSlug = 'triseum-demo-classroom';
const triseumDemoClassroomGameListingId = '00000000-0000-4000-8000-000000000904';
const triseumDemoGameVersionSeedId = '00000000-0000-4000-8000-000000000314';
const triseumDemoPublicListingSeed = publicListingSeedList.find(
	({ gameVersionSeedId }) => gameVersionSeedId === triseumDemoGameVersionSeedId,
)!;

export const triseumClassroomSeedData: CatalogSeedData = {
	...triseumCatalogSeedData,
	classroomGameListingSeedList: [
		{
			id: triseumDemoClassroomGameListingId,
			classroomSlug: triseumDemoClassroomSlug,
			gameSlug: 'arte-mecenas',
			gameVersionSeedId: triseumDemoGameVersionSeedId,
			designatedPayor: ClassroomGameListingDesignatedPayor.STUDENT,
		},
	],
	classroomSeedList: [
		{
			id: '00000000-0000-4000-8000-000000000903',
			institutionSlug: triseumDemoInstitutionSlug,
			name: 'ARTé Classroom Demo',
			code: 'ARTE-DEMO-01',
			language: 'en',
			courseType: 'game-based',
			slug: triseumDemoClassroomSlug,
			status: EducationCatalogStatus.ACTIVE,
			courseSlugList: [triseumDemoCourseSlug],
			instructorSlugList: ['user2-instructor'],
			taxonomyTermKeyList: [
				`${TaxonomyType.Subject}:art-history`,
				`${TaxonomyType.Category}:humanities`,
			],
		},
	],
	courseSeedList: [
		{
			id: '00000000-0000-4000-8000-000000000902',
			institutionSlug: triseumDemoInstitutionSlug,
			name: 'Art History Through Games',
			code: 'ARTE-101',
			slug: triseumDemoCourseSlug,
			status: EducationCatalogStatus.ACTIVE,
		},
	],
	institutionSeedList: [
		{
			id: '00000000-0000-4000-8000-000000000901',
			name: 'Triseum Demo University',
			slug: triseumDemoInstitutionSlug,
			instructorSlugList: ['user2-instructor'],
			status: EducationCatalogStatus.ACTIVE,
		},
	],
	instructorSeedList: instructorSeedList.filter(({ slug }) => slug === 'user2-instructor'),
	publicListingSeedList: [triseumDemoPublicListingSeed],
	userGameLicenseSeedList: [
		{
			id: '00000000-0000-4000-8000-000000000905',
			email: 'user1@scholark.com',
			language: 'en',
			publicListingSeedId: triseumDemoPublicListingSeed.id,
			classroomGameListingSeedId: triseumDemoClassroomGameListingId,
			startAt: new Date('2026-10-01T00:00:00.000Z'),
			endAt: new Date('2027-04-01T23:59:59.999Z'),
		},
	],
};
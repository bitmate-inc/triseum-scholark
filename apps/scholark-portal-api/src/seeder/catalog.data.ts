import { EducationCatalogStatus } from '../app/core/feature/education/model/education.catalog.status';
import {
	InstitutionContractDesignatedPayor,
	InstitutionContractStatus,
	InstitutionContractType,
} from '../app/core/feature/education/model/institution.contract.entity';
import type { Media } from '../app/core/feature/media/model/media';
import { TaxonomyType } from '../app/core/feature/taxonomy/model/taxonomy.term.entity';
import { Currency } from '../app/core/shared/commerce/model/currency';
import { randomInRange } from '../lib/util/random';

export interface TaxonomyTermSeed {
	id: string;
	type: TaxonomyType;
	label: string;
	slug: string;
	isPrimary: boolean;
	sortOrder: number;
}

export interface PublisherSeed {
	id: string;
	name: string;
	slug: string;
	websiteUrl?: string;
}

export interface GameSeed {
	id: string;
	slug: string;
	title: string;
	summary: string;
	description: string;
	cover: Media;
	publisherSlugList: string[];
	taxonomyList: TaxonomyTermSeed[];
	estimatedLengthMinutesMin: number;
	estimatedLengthMinutesMax: number;
	isFeatured: boolean;
	publishedAt: Date;
	mediaList: Media[];
}

export interface MoneySeed {
	minorUnitAmount: number;
	currency: Currency;
}

export interface GameVersionSeed {
	id: string;
	gameSlug: string;
	description?: string;
	publisherVersion: string;
	publishedAt: Date;
	runUrl: string;
}

export interface GameProductSeed {
	id: string;
	gameVersionSeedId: string;
	price: MoneySeed;
}

export interface GameCustomizationSeed {
	id: string;
	gameVersionSeedId: string;
	content: Record<string, unknown>;
	publishedAt?: Date;
}

export interface InstitutionContractGameProductSeed {
	gameProductSeedId: string;
	licenseDurationDays: number;
}

export interface InstitutionContractSeed {
	id: string;
	institutionSlug: string;
	type: InstitutionContractType;
	designatedPayor: InstitutionContractDesignatedPayor;
	status: InstitutionContractStatus;
	startAt: Date;
	endAt: Date;
	gameProductList: InstitutionContractGameProductSeed[];
}

export interface InstitutionSeed {
	id: string;
	name: string;
	slug: string;
	instructorSlugList: string[];
	cover?: Media;
	summary?: string;
	description?: string;
	websiteUrl?: string;
	status: EducationCatalogStatus;
}

export interface InstructorSeed {
	id: string;
	name: string;
	slug: string;
}

export interface CourseSeed {
	id: string;
	institutionSlug: string;
	name: string;
	code: string;
	slug: string;
	cover?: Media;
	summary?: string;
	description?: string;
	status: EducationCatalogStatus;
}

export interface ClassroomSeed {
	id: string;
	institutionSlug: string;
	name: string;
	code: string;
	slug: string;
	cover?: Media;
	summary?: string;
	description?: string;
	status: EducationCatalogStatus;
	courseSlugList: string[];
	instructorSlugList: string[];
	taxonomyTermKeyList: string[];
}

export interface ClassroomGameSeed {
	id: string;
	classroomSlug: string;
	gameSlug: string;
	gameProductSeedId: string;
	customizationSeedId?: string;
}

export interface UserGameLicenseSeed {
	id: string;
	email: string;
	gameProductSeedId: string;
	customizationSeedId?: string;
	classroomGameSeedId?: string;
	startAt: Date;
	endAt: Date;
}

type TaxonomyTermSeedInput = Pick<TaxonomyTermSeed, 'label' | 'slug' | 'type'> & {
	isPrimary?: boolean;
};

let taxonomyTermId = 0;

function createTaxonomyList(
	taxonomyTermSeedList: TaxonomyTermSeedInput[],
): TaxonomyTermSeed[] {
	return taxonomyTermSeedList.map(({ isPrimary, ...taxonomyTerm }, index) => ({
		id: `00000000-0000-4000-8000-${String(++taxonomyTermId).padStart(12, '0')}`,
		isPrimary: isPrimary ?? index === 0,
		sortOrder: index,
		...taxonomyTerm,
	}));
}

function createGameProductMoneyAmount() {
	return randomInRange(500, 5000, 100)
}

export const publisherSeedList: PublisherSeed[] = [
	{
		id: '00000000-0000-4000-8000-000000000101',
		name: 'Triseum',
		slug: 'triseum',
		websiteUrl: 'https://triseum.com',
	},
];

export const instructorSeedList: InstructorSeed[] = [
	{
		id: '00000000-0000-4000-8000-000000000241',
		name: 'Dr. Elena Rossi',
		slug: 'elena-rossi',
	},
	{
		id: '00000000-0000-4000-8000-000000000242',
		name: 'Professor Marcus Chen',
		slug: 'marcus-chen',
	},
	{
		id: '00000000-0000-4000-8000-000000000243',
		name: 'Dr. Priya Shah',
		slug: 'priya-shah',
	},
];

export const gameSeedList: GameSeed[] = [
	{
		id: '00000000-0000-4000-8000-000000000001',
		slug: 'arte-mecenas',
		title: 'ARTé: Mecenas',
		summary: 'Build influence, commission masters, and shape the cultural legacy of Renaissance Florence.',
		description: 'Step into the world of the Italian Renaissance as a merchant-banker navigating politics, patronage, and power. Every commission is a calculated choice: support an emerging artist, strengthen a family alliance, or invest in the civic works that will define Florence for generations. ARTé: Mecenas turns primary-source thinking and art history into a living strategy experience.',
		cover: {
			type: 'image',
			src: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1800&q=85',
			alt: 'ARTé: Mecenas key art',
		},
		publisherSlugList: ['triseum'],
		taxonomyList: createTaxonomyList([
			{ type: TaxonomyType.Subject, label: 'Art History', slug: 'art-history' },
			{ type: TaxonomyType.Genre, label: 'Strategy', slug: 'strategy' },
			{ type: TaxonomyType.Category, label: 'Humanities', slug: 'humanities' },
		]),
		estimatedLengthMinutesMin: 240,
		estimatedLengthMinutesMax: 360,
		isFeatured: true,
		publishedAt: new Date('2026-01-01T00:00:00.000Z'),
		mediaList: [
			{
				type: 'image',
				src: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1400&q=85',
				alt: 'Vibrant Renaissance-inspired painted detail',
			},
			{
				type: 'video',
				src: '/game-trailer.mp4',
				alt: 'ARTé: Mecenas gameplay trailer',
			},
			{
				type: 'image',
				src: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1400&q=85',
				alt: 'Classical painted portrait in a gallery',
			},
		],
	},
	{
		id: '00000000-0000-4000-8000-000000000002',
		slug: 'variant-limits',
		title: 'Variant: Limits',
		summary: 'Repair a fractured world by mastering limits, continuity, and the mathematics of motion.',
		description: "Explore a beautifully unstable world where mathematical reasoning powers every tool. Students investigate limits through visual puzzles, test conjectures, and build an intuitive foundation for calculus while restoring the planet's broken systems.",
		cover: {
			type: 'image',
			src: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=85',
			alt: 'Variant: Limits key art',
		},
		publisherSlugList: ['triseum'],
		taxonomyList: createTaxonomyList([
			{ type: TaxonomyType.Subject, label: 'Calculus', slug: 'calculus' },
			{ type: TaxonomyType.Genre, label: 'Adventure', slug: 'adventure' },
			{ type: TaxonomyType.Category, label: 'STEM', slug: 'stem' },
		]),
		estimatedLengthMinutesMin: 180,
		estimatedLengthMinutesMax: 300,
		isFeatured: true,
		publishedAt: new Date('2026-01-02T00:00:00.000Z'),
		mediaList: [],
	},
	{
		id: '00000000-0000-4000-8000-000000000003',
		slug: 'econland',
		title: 'Econland',
		summary: 'Steer a young nation through shocks, tradeoffs, and the consequences of economic policy.',
		description: 'Take responsibility for a dynamic national economy. Balance inflation, employment, growth, and public confidence as global events force difficult decisions with no perfect answer.',
		cover: {
			type: 'image',
			src: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=85',
			alt: 'Econland key art',
		},
		publisherSlugList: ['triseum'],
		taxonomyList: createTaxonomyList([
			{ type: TaxonomyType.Subject, label: 'Economics', slug: 'economics' },
			{ type: TaxonomyType.Genre, label: 'Simulation', slug: 'simulation' },
			{ type: TaxonomyType.Theme, label: 'Policy', slug: 'policy' },
		]),
		estimatedLengthMinutesMin: 120,
		estimatedLengthMinutesMax: 240,
		isFeatured: true,
		publishedAt: new Date('2026-01-03T00:00:00.000Z'),
		mediaList: [],
	},
	{
		id: '00000000-0000-4000-8000-000000000004',
		slug: 'shadow-of-the-plague',
		title: 'Shadow of the Plague',
		summary: 'Follow the evidence across medieval Europe and uncover how societies respond to crisis.',
		description: 'Investigate competing accounts from a society under pressure. Compare evidence, question narrators, and trace how disease transformed institutions and everyday life.',
		cover: {
			type: 'image',
			src: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1600&q=85',
			alt: 'Shadow of the Plague key art',
		},
		publisherSlugList: ['triseum'],
		taxonomyList: createTaxonomyList([
			{ type: TaxonomyType.Subject, label: 'History', slug: 'history' },
			{ type: TaxonomyType.Genre, label: 'Investigation', slug: 'investigation' },
			{ type: TaxonomyType.Category, label: 'Humanities', slug: 'humanities' },
		]),
		estimatedLengthMinutesMin: 120,
		estimatedLengthMinutesMax: 180,
		isFeatured: true,
		publishedAt: new Date('2026-01-04T00:00:00.000Z'),
		mediaList: [],
	},
	{
		id: '00000000-0000-4000-8000-000000000005',
		slug: 'orbital-commons',
		title: 'Orbital Commons',
		summary: 'Negotiate the future of shared space infrastructure before cooperation falls out of orbit.',
		description: 'Represent competing institutions in a systems-level negotiation about resources, research, and responsibility beyond Earth.',
		cover: {
			type: 'image',
			src: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=85',
			alt: 'Orbital Commons key art',
		},
		publisherSlugList: ['triseum'],
		taxonomyList: createTaxonomyList([
			{ type: TaxonomyType.Subject, label: 'Civics', slug: 'civics' },
			{ type: TaxonomyType.Skill, label: 'Systems Thinking', slug: 'systems-thinking' },
			{ type: TaxonomyType.Genre, label: 'Multiplayer', slug: 'multiplayer' },
		]),
		estimatedLengthMinutesMin: 60,
		estimatedLengthMinutesMax: 90,
		isFeatured: true,
		publishedAt: new Date('2026-01-05T00:00:00.000Z'),
		mediaList: [],
	},
	{
		id: '00000000-0000-4000-8000-000000000006',
		slug: 'the-archive',
		title: 'The Archive',
		summary: 'Reconstruct a lost public record and decide which stories are trustworthy enough to preserve.',
		description: 'Search fragmented records, identify bias, and assemble a defensible account from incomplete digital evidence.',
		cover: {
			type: 'image',
			src: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=85',
			alt: 'The Archive key art',
		},
		publisherSlugList: ['triseum'],
		taxonomyList: createTaxonomyList([
			{ type: TaxonomyType.Skill, label: 'Media Literacy', slug: 'media-literacy' },
			{ type: TaxonomyType.Genre, label: 'Puzzle', slug: 'puzzle' },
			{ type: TaxonomyType.Skill, label: 'Research', slug: 'research' },
		]),
		estimatedLengthMinutesMin: 90,
		estimatedLengthMinutesMax: 120,
		isFeatured: true,
		publishedAt: new Date('2026-01-06T00:00:00.000Z'),
		mediaList: [],
	},
	{
		id: '00000000-0000-4000-8000-000000000007',
		slug: 'signal-and-noise',
		title: 'Signal & Noise',
		summary: 'Find the pattern, challenge the model, and solve a mystery hidden inside imperfect data.',
		description: 'Use real statistical habits to distinguish meaningful evidence from coincidence in an unfolding campus mystery.',
		cover: {
			type: 'image',
			src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=85',
			alt: 'Signal & Noise key art',
		},
		publisherSlugList: ['triseum'],
		taxonomyList: createTaxonomyList([
			{ type: TaxonomyType.Subject, label: 'Data Science', slug: 'data-science' },
			{ type: TaxonomyType.Genre, label: 'Mystery', slug: 'mystery' },
			{ type: TaxonomyType.Subject, label: 'Statistics', slug: 'statistics' },
		]),
		estimatedLengthMinutesMin: 120,
		estimatedLengthMinutesMax: 180,
		isFeatured: false,
		publishedAt: new Date('2026-01-07T00:00:00.000Z'),
		mediaList: [],
	},
];

export const gameVersionSeedList: GameVersionSeed[] = gameSeedList.flatMap((game, index) => [
	{
		gameSlug: game.slug,
		id: `00000000-0000-4000-8000-${String(301 + index).padStart(12, '0')}`,
		publishedAt: game.publishedAt,
		description: 'The initial published build of this learning experience.',
		publisherVersion: '1.0.0',
		runUrl: `https://play.triseum.com/${game.slug}`,
	},
	...(game.slug === 'arte-mecenas' ? [
		{
			gameSlug: game.slug,
			id: '00000000-0000-4000-8000-000000000311',
			publishedAt: new Date('2026-03-01T00:00:00.000Z'),
			description: 'Expanded content and updated classroom activities.',
			publisherVersion: '1.4.0',
			runUrl: 'https://play.triseum.com/arte-mecenas',
		},
		{
			gameSlug: game.slug,
			id: '00000000-0000-4000-8000-000000000312',
			publishedAt: new Date('2026-05-15T00:00:00.000Z'),
			description: 'A shorter demo build for introductory exploration.',
			publisherVersion: 'v1.4.1-demo',
			runUrl: 'https://play.triseum.com/arte-mecenas/demo',
		},
	] : []),
	...(game.slug === 'variant-limits' ? [{
		gameSlug: game.slug,
		id: '00000000-0000-4000-8000-000000000313',
		publishedAt: new Date('2026-04-10T00:00:00.000Z'),
		description: 'Refined scenarios focused on interpreting variation.',
		publisherVersion: '1.1.0',
		runUrl: 'https://play.triseum.com/variant-limits',
	}] : []),
]);

export const gameProductSeedList: GameProductSeed[] = gameVersionSeedList.map((gameVersionSeed, index) => ({
	id: `00000000-0000-4000-8000-${String(601 + index).padStart(12, '0')}`,
	gameVersionSeedId: gameVersionSeed.id,
	price: {
		minorUnitAmount: createGameProductMoneyAmount(),
		currency: Currency.USD,
	},
}));

export const gameCustomizationSeedList: GameCustomizationSeed[] = [
	{
		content: {
			introText: 'Welcome to the Florence patronage seminar.',
			mediaList: [
				{
					alt: 'Florence skyline at sunset',
					src: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1200&q=85',
				},
			],
		},
		gameVersionSeedId: gameVersionSeedList.find((seed) => seed.gameSlug === 'arte-mecenas')!.id,
		id: '00000000-0000-4000-8000-000000000321',
		publishedAt: new Date('2026-02-01T00:00:00.000Z'),
	},
	{
		content: {
			introText: 'Demo content for the spring pilot.',
			mediaList: [],
		},
		gameVersionSeedId: '00000000-0000-4000-8000-000000000312',
		id: '00000000-0000-4000-8000-000000000322',
		publishedAt: new Date('2026-06-01T00:00:00.000Z'),
	},
	{
		content: {
			introText: 'Draft localization and instructor notes.',
			mediaList: [],
		},
		gameVersionSeedId: '00000000-0000-4000-8000-000000000313',
		id: '00000000-0000-4000-8000-000000000323',
	},
];

const additionalInstitutionProfileList = [
	['Lakeshore State University', 'lakeshore-state-university', ['elena-rossi', 'priya-shah'], 'A public university combining applied research with broad undergraduate study.'],
	['Cedar Valley Institute', 'cedar-valley-institute', ['marcus-chen', 'priya-shah'], 'A regional institute known for practical technology and design programs.'],
	['Summit Polytechnic', 'summit-polytechnic', ['elena-rossi'], 'A hands-on polytechnic focused on engineering, computing, and sustainable systems.'],
	['Harborview University', 'harborview-university', ['marcus-chen', 'elena-rossi'], 'A coastal university with strong programs in business, policy, and environmental studies.'],
	['Westfield College', 'westfield-college', ['priya-shah'], 'A liberal arts college centered on writing, civic engagement, and creative practice.'],
	['Pinecrest Community College', 'pinecrest-community-college', ['elena-rossi', 'priya-shah'], 'An accessible community college serving a diverse metropolitan region.'],
	['Redwood School of Design', 'redwood-school-of-design', ['marcus-chen'], 'A specialist school for digital media, communication, and experience design.'],
	['Eastgate University', 'eastgate-university', ['elena-rossi', 'marcus-chen'], 'A comprehensive university with a strong tradition of interdisciplinary teaching.'],
	['Meadowbrook Teachers College', 'meadowbrook-teachers-college', ['priya-shah'], 'A teacher preparation college emphasizing evidence-based learning and inclusion.'],
	['Stonebridge Conservatory', 'stonebridge-conservatory', ['elena-rossi'], 'A conservatory connecting performance, music technology, and cultural scholarship.'],
	['Brighton School of Public Affairs', 'brighton-school-public-affairs', ['marcus-chen', 'priya-shah'], 'A graduate-focused school preparing leaders for public and nonprofit service.'],
	['Oakridge University', 'oakridge-university', ['elena-rossi', 'marcus-chen'], 'A research university with programs spanning health, science, and the humanities.'],
	['Maple City College', 'maple-city-college', ['priya-shah', 'marcus-chen'], 'A practical urban college offering flexible pathways into professional study.'],
	['Bluewater Marine Institute', 'bluewater-marine-institute', ['elena-rossi'], 'A specialist institute dedicated to marine science and coastal resilience.'],
] as const;

function createAdditionalInstitutionSeedList(): InstitutionSeed[] {
	return additionalInstitutionProfileList.map(([name, slug, instructorSlugList, description], index) => ({
		description,
		id: `00000000-0000-4000-8000-${String(400 + index).padStart(12, '0')}`,
		instructorSlugList: [...instructorSlugList],
		name,
		slug,
		status: EducationCatalogStatus.ACTIVE,
		summary: `${name} offers career-ready learning and collaborative academic study.`,
		websiteUrl: `https://${slug}.example.edu`,
	}));
}

export const institutionSeedList: InstitutionSeed[] = [
	{
		cover: {
			alt: 'Northbridge University campus library',
			src: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=85',
			type: 'image',
		},
		description: 'A public research university offering interdisciplinary programs.',
		id: '00000000-0000-4000-8000-000000000201',
		instructorSlugList: ['elena-rossi', 'marcus-chen'],
		name: 'Northbridge University',
		slug: 'northbridge-university',
		status: EducationCatalogStatus.ACTIVE,
		summary: 'Interdisciplinary learning shaped by research, culture, and public impact.',
		websiteUrl: 'https://northbridge.example.edu',
	},
	{
		cover: {
			alt: 'Riverside College historic academic building',
			src: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=1800&q=85',
			type: 'image',
		},
		description: 'An independent college focused on arts, history, and civic studies.',
		id: '00000000-0000-4000-8000-000000000202',
		instructorSlugList: ['priya-shah'],
		name: 'Riverside College',
		slug: 'riverside-college',
		status: EducationCatalogStatus.ACTIVE,
		summary: 'A close-knit college for arts, history, and civic inquiry.',
		websiteUrl: 'https://riverside.example.edu',
	},
	...createAdditionalInstitutionSeedList(),
];

const additionalCourseNameList = [
	['Introduction to Data Science', 'DATA'],
	['Environmental Systems', 'ENVS'],
	['Digital Communication', 'COMM'],
	['Research Methods', 'RES'],
	['Applied Statistics', 'STAT'],
	['Ethics and Public Life', 'ETH'],
] as const;

function createAdditionalCourseSeedList(): CourseSeed[] {
	return institutionSeedList.slice(2).flatMap((institution, institutionIndex) => {
		const courseCount = 3 + (institutionIndex % 4);

		return additionalCourseNameList.slice(0, courseCount).map(([name, codePrefix], courseIndex) => ({
			code: `${codePrefix}-${100 + institutionIndex * 10 + courseIndex}`,
			description: `${name} in the context of ${institution.name}.`,
			id: `00000000-0000-4000-8000-${String(450 + institutionIndex * 10 + courseIndex).padStart(12, '0')}`,
			institutionSlug: institution.slug,
			name,
			slug: `${institution.slug}-${name.toLowerCase().replaceAll(' ', '-')}`,
			status: EducationCatalogStatus.ACTIVE,
			summary: `An undergraduate course in ${name.toLowerCase()}.`,
		}));
	});
}

export const institutionContractSeedList: InstitutionContractSeed[] = [
	{
		designatedPayor: InstitutionContractDesignatedPayor.STUDENT,
		endAt: new Date('2026-12-31T23:59:59.999Z'),
		gameProductList: createInstitutionContractGameProductList([
			'00000000-0000-4000-8000-000000000312',
			'shadow-of-the-plague',
		]),
		id: '00000000-0000-4000-8000-000000000331',
		institutionSlug: 'northbridge-university',
		startAt: new Date('2026-01-01T00:00:00.000Z'),
		status: InstitutionContractStatus.ACTIVE,
		type: InstitutionContractType.ADOPTION,
	},
	{
		designatedPayor: InstitutionContractDesignatedPayor.STUDENT,
		endAt: new Date('2026-12-31T23:59:59.999Z'),
		gameProductList: createInstitutionContractGameProductList(['variant-limits']),
		id: '00000000-0000-4000-8000-000000000332',
		institutionSlug: 'riverside-college',
		startAt: new Date('2026-01-01T00:00:00.000Z'),
		status: InstitutionContractStatus.ACTIVE,
		type: InstitutionContractType.PILOT,
	},
	...createAdditionalInstitutionContractSeedList(),
];

function createAdditionalInstitutionContractSeedList(): InstitutionContractSeed[] {
	const contractGameSlugList = ['arte-mecenas', 'variant-limits', 'econland'];

	return institutionSeedList.slice(2).map((institution, institutionIndex) => ({
		designatedPayor: institutionIndex % 3 === 0
			? InstitutionContractDesignatedPayor.INSTITUTION
			: InstitutionContractDesignatedPayor.STUDENT,
		endAt: new Date('2027-12-31T23:59:59.999Z'),
		gameProductList: createInstitutionContractGameProductList(contractGameSlugList),
		id: `00000000-0000-4000-8000-${String(700 + institutionIndex).padStart(12, '0')}`,
		institutionSlug: institution.slug,
		startAt: new Date('2026-01-01T00:00:00.000Z'),
		status: InstitutionContractStatus.ACTIVE,
		type: institutionIndex % 2 === 0
			? InstitutionContractType.ADOPTION
			: InstitutionContractType.PILOT,
	}));
}


function createInstitutionContractGameProductList(gameSlugList: string[]): InstitutionContractGameProductSeed[] {
	return gameSlugList.map((gameSlugOrVersionId) => {
		const gameVersion = gameVersionSeedList.find((seed) =>
			seed.id === gameSlugOrVersionId || seed.gameSlug === gameSlugOrVersionId,
		)!;
		const gameProduct = gameProductSeedList.find((seed) => seed.gameVersionSeedId === gameVersion.id)!;

		return {
			gameProductSeedId: gameProduct.id,
			licenseDurationDays: 120,
		};
	});
}

export const courseSeedList: CourseSeed[] = [
	{
		code: 'ARTH-201',
		cover: {
			alt: 'Renaissance gallery interior',
			src: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1600&q=85',
			type: 'image',
		},
		description: 'Art, patronage, and civic identity in Renaissance Italy.',
		id: '00000000-0000-4000-8000-000000000211',
		institutionSlug: 'northbridge-university',
		name: 'Renaissance Art and Society',
		slug: 'renaissance-art-and-society',
		status: EducationCatalogStatus.ACTIVE,
		summary: 'Explore how art, money, and influence shaped Renaissance Florence.',
	},
	{
		code: 'HIST-230',
		cover: {
			alt: 'Historic European city architecture',
			src: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=85',
			type: 'image',
		},
		description: 'Methods for interpreting social and cultural change in Europe.',
		id: '00000000-0000-4000-8000-000000000212',
		institutionSlug: 'northbridge-university',
		name: 'European Cultural History',
		slug: 'european-cultural-history',
		status: EducationCatalogStatus.ACTIVE,
		summary: 'Read Europe through the ideas, institutions, and objects its people left behind.',
	},
	{
		code: 'MATH-150',
		cover: {
			alt: 'Mathematical formulas on a classroom board',
			src: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&q=85',
			type: 'image',
		},
		description: 'A conceptual introduction to limits and continuity.',
		id: '00000000-0000-4000-8000-000000000213',
		institutionSlug: 'riverside-college',
		name: 'Foundations of Calculus',
		slug: 'foundations-of-calculus',
		status: EducationCatalogStatus.ACTIVE,
		summary: 'Build an intuitive foundation for limits, continuity, and calculus.',
	},
	...createAdditionalCourseSeedList(),
];

function createAdditionalClassroomSeedList(): ClassroomSeed[] {
	const taxonomyTermKeyList = [
		`${TaxonomyType.Subject}:data-science`,
		`${TaxonomyType.Subject}:history`,
		`${TaxonomyType.Subject}:civics`,
		`${TaxonomyType.Category}:stem`,
	];

	return institutionSeedList.slice(2).flatMap((institution, institutionIndex) => {
		const institutionCourseList = courseSeedList.filter(
			(course) => course.institutionSlug === institution.slug,
		);
		const classroomCount = 2 + (institutionIndex % 3);

		return Array.from({ length: classroomCount }, (_, classroomIndex) => ({
			code: `${institution.slug.slice(0, 8).toUpperCase()}-${classroomIndex + 1}`,
			courseSlugList: [
				institutionCourseList[classroomIndex % institutionCourseList.length].slug,
				...(classroomIndex % 2 === 0 && institutionCourseList.length > 1
					? [institutionCourseList[(classroomIndex + 1) % institutionCourseList.length].slug]
					: []),
			],
			description: `An active ${institution.name} classroom for collaborative applied learning.`,
			id: `00000000-0000-4000-8000-${String(550 + institutionIndex * 10 + classroomIndex).padStart(12, '0')}`,
			institutionSlug: institution.slug,
			instructorSlugList: [...institution.instructorSlugList],
			name: `${institution.name} ${classroomIndex + 1}`,
			slug: `${institution.slug}-classroom-${classroomIndex + 1}`,
			status: EducationCatalogStatus.ACTIVE,
			summary: `A course section hosted by ${institution.name}.`,
			taxonomyTermKeyList: [taxonomyTermKeyList[institutionIndex % taxonomyTermKeyList.length]],
		}));
	});
}

export const classroomSeedList: ClassroomSeed[] = [
	{
		code: 'FLORENCE-01',
		cover: {
			alt: 'Florence skyline and cathedral',
			src: 'https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?auto=format&fit=crop&w=1600&q=85',
			type: 'image',
		},
		courseSlugList: ['renaissance-art-and-society', 'european-cultural-history'],
		id: '00000000-0000-4000-8000-000000000221',
		institutionSlug: 'northbridge-university',
		instructorSlugList: ['elena-rossi', 'marcus-chen'],
		name: 'Florence Seminar',
		description: 'A cross-listed seminar using game-based inquiry to connect art history with the political and social life of Renaissance Florence.',
		slug: 'florence-seminar-fall-2026',
		status: EducationCatalogStatus.ACTIVE,
		summary: 'A cross-disciplinary seminar on art, power, and civic life in Renaissance Florence.',
		taxonomyTermKeyList: [
			`${TaxonomyType.Subject}:art-history`,
			`${TaxonomyType.Category}:humanities`,
		],
	},
	{
		code: 'LIMITS-01',
		cover: {
			alt: 'Students collaborating on mathematics',
			src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=85',
			type: 'image',
		},
		courseSlugList: ['foundations-of-calculus'],
		id: '00000000-0000-4000-8000-000000000222',
		institutionSlug: 'riverside-college',
		instructorSlugList: ['priya-shah'],
		name: 'Limits Lab',
		description: 'A guided lab where students investigate limits through visual models, collaborative problems, and game-based practice.',
		slug: 'limits-lab-fall-2026',
		status: EducationCatalogStatus.ACTIVE,
		summary: 'A hands-on calculus lab for exploring limits through models and play.',
		taxonomyTermKeyList: [`${TaxonomyType.Subject}:calculus`],
	},
	...createAdditionalClassroomSeedList(),
];

export const classroomGameSeedList: ClassroomGameSeed[] = [
	{
		classroomSlug: 'florence-seminar-fall-2026',
		gameSlug: 'arte-mecenas',
		gameProductSeedId: gameProductSeedList.find((seed) => seed.gameVersionSeedId === '00000000-0000-4000-8000-000000000312')!.id,
		customizationSeedId: '00000000-0000-4000-8000-000000000322',
		id: '00000000-0000-4000-8000-000000000231',
	},
	{
		classroomSlug: 'florence-seminar-fall-2026',
		gameSlug: 'shadow-of-the-plague',
		gameProductSeedId: gameProductSeedList.find((seed) => seed.gameVersionSeedId === gameVersionSeedList.find((version) => version.gameSlug === 'shadow-of-the-plague')!.id)!.id,
		id: '00000000-0000-4000-8000-000000000232',
	},
	{
		classroomSlug: 'limits-lab-fall-2026',
		gameSlug: 'variant-limits',
		gameProductSeedId: gameProductSeedList.find((seed) => seed.gameVersionSeedId === gameVersionSeedList.find((version) => version.gameSlug === 'variant-limits')!.id)!.id,
		id: '00000000-0000-4000-8000-000000000233',
	},
	...createAdditionalClassroomGameSeedList(),
];

function createAdditionalClassroomGameSeedList(): ClassroomGameSeed[] {
	const contractGameSlugList = ['arte-mecenas', 'variant-limits', 'econland'];

	return classroomSeedList.slice(2).flatMap((classroom, classroomIndex) => {
		const firstGameSlug = contractGameSlugList[classroomIndex % contractGameSlugList.length];
		const gameSlugList = classroomIndex % 2 === 0
			? [firstGameSlug, contractGameSlugList[(classroomIndex + 1) % contractGameSlugList.length]]
			: [firstGameSlug];

		return gameSlugList.map((gameSlug, gameIndex) => {
			const gameVersion = gameVersionSeedList.find((seed) => seed.gameSlug === gameSlug)!;
			const gameProduct = gameProductSeedList.find((seed) => seed.gameVersionSeedId === gameVersion.id)!;

			return {
				classroomSlug: classroom.slug,
				gameSlug,
				gameProductSeedId: gameProduct.id,
				id: `00000000-0000-4000-8000-${String(800 + classroomIndex * 10 + gameIndex).padStart(12, '0')}`,
			};
		});
	});
}

export const userGameLicenseSeedList: UserGameLicenseSeed[] = [
	{
		classroomGameSeedId: '00000000-0000-4000-8000-000000000231',
		customizationSeedId: '00000000-0000-4000-8000-000000000322',
		email: 'user1@scholark.com',
		endAt: new Date('2026-10-30T23:59:59.999Z'),
		gameProductSeedId: gameProductSeedList.find((seed) => seed.gameVersionSeedId === '00000000-0000-4000-8000-000000000312')!.id,
		id: '00000000-0000-4000-8000-000000000341',
		startAt: new Date('2026-06-01T00:00:00.000Z'),
	},
	{
		classroomGameSeedId: '00000000-0000-4000-8000-000000000232',
		email: 'user1@scholark.com',
		endAt: new Date('2026-12-15T23:59:59.999Z'),
		gameProductSeedId: gameProductSeedList.find((seed) => seed.gameVersionSeedId === gameVersionSeedList.find((version) => version.gameSlug === 'shadow-of-the-plague')!.id)!.id,
		id: '00000000-0000-4000-8000-000000000342',
		startAt: new Date('2026-08-20T00:00:00.000Z'),
	},
	{
		email: 'user1@scholark.com',
		endAt: new Date('2026-05-01T23:59:59.999Z'),
		gameProductSeedId: gameProductSeedList.find((seed) => seed.gameVersionSeedId === gameVersionSeedList.find((version) => version.gameSlug === 'variant-limits')!.id)!.id,
		id: '00000000-0000-4000-8000-000000000343',
		startAt: new Date('2026-01-20T00:00:00.000Z'),
	},
	{
		email: 'student2@scholark.com',
		endAt: new Date('2027-01-31T23:59:59.999Z'),
		gameProductSeedId: gameProductSeedList.find((seed) => seed.gameVersionSeedId === gameVersionSeedList.find((version) => version.gameSlug === 'econland')!.id)!.id,
		id: '00000000-0000-4000-8000-000000000344',
		startAt: new Date('2026-09-01T00:00:00.000Z'),
	},
	{
		classroomGameSeedId: '00000000-0000-4000-8000-000000000233',
		email: 'student2@scholark.com',
		endAt: new Date('2026-12-20T23:59:59.999Z'),
		gameProductSeedId: gameProductSeedList.find((seed) => seed.gameVersionSeedId === '00000000-0000-4000-8000-000000000313')!.id,
		id: '00000000-0000-4000-8000-000000000345',
		startAt: new Date('2026-09-01T00:00:00.000Z'),
	},
];

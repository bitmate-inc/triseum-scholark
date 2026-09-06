import { EducationCatalogStatus } from '../app/core/feature/education/model/education.catalog.status';
import type { Media } from '../app/core/feature/media/model/media';
import { TaxonomyType } from '../app/core/feature/taxonomy/model/taxonomy.term.entity';

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

export interface EducationalInstitutionSeed {
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

export const educationalInstitutionSeedList: EducationalInstitutionSeed[] = [
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
];

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
];

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
];

export const classroomGameSeedList: ClassroomGameSeed[] = [
	{
		classroomSlug: 'florence-seminar-fall-2026',
		gameSlug: 'arte-mecenas',
		id: '00000000-0000-4000-8000-000000000231',
	},
	{
		classroomSlug: 'florence-seminar-fall-2026',
		gameSlug: 'shadow-of-the-plague',
		id: '00000000-0000-4000-8000-000000000232',
	},
	{
		classroomSlug: 'limits-lab-fall-2026',
		gameSlug: 'variant-limits',
		id: '00000000-0000-4000-8000-000000000233',
	},
];
import type { GameMedia } from '../app/core/feature/game/model/game.entity';
import { TaxonomyType } from '../app/core/feature/taxonomy/model/taxonomy.term.entity';

export interface TaxonomyTermSeed {
	id: string;
	type: TaxonomyType;
	label: string;
	slug: string;
	isPrimary: boolean;
	sortOrder: number;
}

export interface GameSeed {
	id: string;
	slug: string;
	title: string;
	summary: string;
	description: string;
	cover: GameMedia;
	taxonomyList: TaxonomyTermSeed[];
	estimatedLengthMinutesMin: number;
	estimatedLengthMinutesMax: number;
	isFeatured: boolean;
	publishedAt: Date;
	mediaList: GameMedia[];
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
export type GameMedia = {
	type: "image" | "video";
	src: string;
	alt: string;
};

export type TaxonomyType = "category" | "genre" | "skill" | "subject" | "theme";

export type TaxonomyTerm = {
	id: string;
	type: TaxonomyType;
	label: string;
	slug: string;
};

export type GameTaxonomyTerm = {
	taxonomyTerm: TaxonomyTerm;
	isPrimary: boolean;
	sortOrder: number;
};

export type Game = {
	id: string;
	slug: string;
	title: string;
	summary?: string;
	description?: string;
	cover?: GameMedia;
	taxonomyList: GameTaxonomyTerm[];
	estimatedLengthMinutesMin?: number;
	estimatedLengthMinutesMax?: number;
	featured?: boolean;
	mediaList?: GameMedia[];
	publishedAt?: string;
};

export type GetGameListResponse = {
	gameList: Game[];
	totalItemCount: number;
};

export type GetGameListQuery = {
	q?: string;
	limit?: number;
	offset?: number;
};

export type GetGameResponse = {
	game: Game;
};

export function getGameTagList(game: Game): string[] {
	return [...game.taxonomyList]
		.sort((left, right) => left.sortOrder - right.sortOrder)
		.map(({ taxonomyTerm }) => taxonomyTerm.label);
}

export function getGameEyebrow(game: Game): string {
	return getGameTagList(game).slice(0, 2).join(" · ");
}

export function formatEstimatedLength(game: Game): string {
	const { estimatedLengthMinutesMin: min, estimatedLengthMinutesMax: max } = game;
	if (min === undefined || max === undefined) return "Length varies";

	if (min % 60 === 0 && max % 60 === 0) {
		return `${min / 60}–${max / 60} hours`;
	}

	return `${min}–${max} minutes`;
}
import type { Media } from "../../../media/shared/model/media";

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

export type Publisher = {
	id: string;
	name: string;
	slug: string;
	websiteUrl?: string;
};

export type Game = {
	id: string;
	slug: string;
	title: string;
	summary?: string;
	description?: string;
	cover?: Media;
	publisher: Publisher;
	taxonomyList: GameTaxonomyTerm[];
	estimatedLengthMinutesMin?: number;
	estimatedLengthMinutesMax?: number;
	featured?: boolean;
	mediaList?: Media[];
	publishedAt?: string;
};

export type GameDetails = Game & { gameVersionList: GameVersion[] };

export type PublicGameListing = {
	id: string;
	priceGroupList: PublicGameListingPriceGroup[];
	startAt: string;
	endAt?: string;
};

export type PublicGameListingPriceGroup = {
	price: {
		minorUnitAmount: number;
		currency: string;
	};
	languageList: string[];
};

export type PublicGameListingOption = {
	id: string;
	listingId: string;
	language: string;
	price: PublicGameListingPriceGroup['price'];
};

export type GameVersion = {
	id: string;
	publicListingList: PublicGameListing[];
	description?: string;
	publisherVersion: string;
	runUrl: string;
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
	gameVersionList: GameVersion[];
};

export function getGameTagList(game: Game): string[] {
	return [...game.taxonomyList]
		.sort((left, right) => left.sortOrder - right.sortOrder)
		.map(({ taxonomyTerm }) => taxonomyTerm.label);
}

export function getGameEyebrow(game: Game): string {
	return getGameTagList(game).slice(0, 2).join(" · ");
}

export function formatEstimatedLength(game: Game, locale: string): string | undefined {
	const { estimatedLengthMinutesMin: min, estimatedLengthMinutesMax: max } = game;
	if (min === undefined || max === undefined) return undefined;

	const useHours = min % 60 === 0 && max % 60 === 0;
	const unit = useHours ? "hour" : "minute";
	const formatter = new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "long" });
	const minValue = useHours ? min / 60 : min;
	const maxValue = useHours ? max / 60 : max;

	return `${formatter.format(minValue)}–${formatter.format(maxValue)}`;
}

export function getPublicGameListingOptionList(listingList: PublicGameListing[]): PublicGameListingOption[] {
	return listingList.flatMap((listing) => listing.priceGroupList.flatMap((priceGroup) =>
		priceGroup.languageList.map((language) => ({
			id: `${listing.id}:${language}`,
			language,
			listingId: listing.id,
			price: priceGroup.price,
		})),
	));
}

export function formatListingPrice(price: PublicGameListingOption['price'], locale: string): string {
	return new Intl.NumberFormat(locale, {
		currency: price.currency,
		style: "currency",
	}).format(price.minorUnitAmount / 100);
}

export function formatListingPriceRange(optionList: PublicGameListingOption[], locale: string): string {
	const optionListByCurrency = new Map<string, PublicGameListingOption[]>();
	for (const option of optionList) {
		const currencyOptionList = optionListByCurrency.get(option.price.currency) ?? [];
		currencyOptionList.push(option);
		optionListByCurrency.set(option.price.currency, currencyOptionList);
	}

	return [...optionListByCurrency.entries()].map(([currency, currencyOptionList]) => {
		const amountList = currencyOptionList.map((option) => option.price.minorUnitAmount);
		const minAmount = Math.min(...amountList) / 100;
		const maxAmount = Math.max(...amountList) / 100;
		const formatter = new Intl.NumberFormat(locale, { currency, style: "currency" });
		const minPrice = formatter.format(minAmount);
		return minAmount === maxAmount ? minPrice : `${minPrice}–${formatter.format(maxAmount)}`;
	}).join(" · ");
}

export function formatListingLanguage(language: string, locale: string): string {
	const languageTag = language.replaceAll("_", "-");
	try {
		return new Intl.DisplayNames([locale], { type: "language" }).of(languageTag) ?? language.toUpperCase();
	} catch {
		return language.toUpperCase();
	}
}

export function formatCourseType(courseType: string): string {
	return courseType
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}
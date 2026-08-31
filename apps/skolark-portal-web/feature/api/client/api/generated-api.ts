import { api } from "./api-base";
const injectedRtkApi = api.injectEndpoints({
	endpoints: (build) => ({
		gameGetGameList: build.query<
			GameGetGameListApiResponse,
			GameGetGameListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/game`,
				params: {
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		gameGetFeaturedGameList: build.query<
			GameGetFeaturedGameListApiResponse,
			GameGetFeaturedGameListApiArg
		>({
			query: () => ({ url: `/api/v1/catalog/game/featured` }),
		}),
		gameGetGame: build.query<GameGetGameApiResponse, GameGetGameApiArg>({
			query: (queryArg) => ({ url: `/api/v1/catalog/game/${queryArg.slug}` }),
		}),
		healthAlive: build.query<HealthAliveApiResponse, HealthAliveApiArg>({
			query: () => ({ url: `/api/v1/health/alive` }),
		}),
		healthCheck: build.query<HealthCheckApiResponse, HealthCheckApiArg>({
			query: () => ({ url: `/api/v1/health/status` }),
		}),
	}),
	overrideExisting: false,
});
export { injectedRtkApi as generatedApi };
export type GameGetGameListApiResponse =
/** status 200  */ GetGameListResponseDto;
export type GameGetGameListApiArg = {
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type GameGetFeaturedGameListApiResponse =
/** status 200  */ GetGameListResponseDto;
export type GameGetFeaturedGameListApiArg = void;
export type GameGetGameApiResponse = /** status 200  */ GetGameResponseDto;
export type GameGetGameApiArg = {
	slug: string;
};
export type HealthAliveApiResponse = unknown;
export type HealthAliveApiArg = void;
export type HealthCheckApiResponse =
/** status 200 The Health Check is successful */ {
		status?: string;
		info?: {
			[key: string]: {
				status: string;
				[key: string]: any;
			};
		} | null;
		error?: {
			[key: string]: {
				status: string;
				[key: string]: any;
			};
		} | null;
		details?: {
			[key: string]: {
				status: string;
				[key: string]: any;
			};
		};
	};
export type HealthCheckApiArg = void;
export type GameMediaResponseDto = {
	type: "image" | "video";
	src: string;
	alt: string;
};
export type TaxonomyType = "category" | "genre" | "skill" | "subject" | "theme";
export type TaxonomyTermResponseDto = {
	id: string;
	type: TaxonomyType;
	label: string;
	slug: string;
};
export type GameTaxonomyTermResponseDto = {
	taxonomyTerm: TaxonomyTermResponseDto;
	isPrimary: boolean;
	sortOrder: number;
};
export type GameResponseDto = {
	id: string;
	title: string;
	slug: string;
	summary?: string;
	description?: string;
	cover?: GameMediaResponseDto;
	taxonomyList: GameTaxonomyTermResponseDto[];
	estimatedLengthMinutesMin?: number;
	estimatedLengthMinutesMax?: number;
	featured?: boolean;
	mediaList?: GameMediaResponseDto[];
	publishedAt?: string;
};
export type GetGameListResponseDto = {
	gameList: GameResponseDto[];
	totalItemCount: number;
};
export type GetGameResponseDto = {
	game: GameResponseDto;
};
export const {
	useGameGetGameListQuery,
	useGameGetFeaturedGameListQuery,
	useGameGetGameQuery,
	useHealthAliveQuery,
	useHealthCheckQuery,
} = injectedRtkApi;

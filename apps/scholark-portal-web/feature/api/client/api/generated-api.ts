import { api } from "./api-base";
const injectedRtkApi = api.injectEndpoints({
	endpoints: (build) => ({
		authGetSession: build.query<
			AuthGetSessionApiResponse,
			AuthGetSessionApiArg
		>({
			query: () => ({ url: `/api/v1/auth/session` }),
		}),
		authRegister: build.mutation<AuthRegisterApiResponse, AuthRegisterApiArg>({
			query: (queryArg) => ({
				url: `/api/v1/auth/register`,
				method: "POST",
				body: queryArg.registerRequestDto,
			}),
		}),
		authLogin: build.mutation<AuthLoginApiResponse, AuthLoginApiArg>({
			query: (queryArg) => ({
				url: `/api/v1/auth/login`,
				method: "POST",
				body: queryArg.loginRequestDto,
			}),
		}),
		authLogout: build.mutation<AuthLogoutApiResponse, AuthLogoutApiArg>({
			query: () => ({ url: `/api/v1/auth/logout`, method: "POST" }),
		}),
		authResendVerification: build.mutation<
			AuthResendVerificationApiResponse,
			AuthResendVerificationApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/auth/email/verification`,
				method: "POST",
				body: queryArg.emailRequestDto,
			}),
		}),
		authConfirmEmail: build.mutation<
			AuthConfirmEmailApiResponse,
			AuthConfirmEmailApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/auth/email/confirmation`,
				method: "POST",
				body: queryArg.tokenRequestDto,
			}),
		}),
		authRequestPasswordReset: build.mutation<
			AuthRequestPasswordResetApiResponse,
			AuthRequestPasswordResetApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/auth/password/reset`,
				method: "POST",
				body: queryArg.emailRequestDto,
			}),
		}),
		authResetPassword: build.mutation<
			AuthResetPasswordApiResponse,
			AuthResetPasswordApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/auth/password/reset/confirmation`,
				method: "POST",
				body: queryArg.resetPasswordRequestDto,
			}),
		}),
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
		userGetOwnUser: build.query<
			UserGetOwnUserApiResponse,
			UserGetOwnUserApiArg
		>({
			query: () => ({ url: `/api/v1/user/me` }),
		}),
		userUpdateProfile: build.mutation<
			UserUpdateProfileApiResponse,
			UserUpdateProfileApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/user/me`,
				method: "PATCH",
				body: queryArg.updateProfileRequestDto,
			}),
		}),
		userChangePassword: build.mutation<
			UserChangePasswordApiResponse,
			UserChangePasswordApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/user/me/password`,
				method: "PUT",
				body: queryArg.changePasswordRequestDto,
			}),
		}),
	}),
	overrideExisting: false,
});
export { injectedRtkApi as generatedApi };
export type AuthGetSessionApiResponse = /** status 200  */ UserResponseDto;
export type AuthGetSessionApiArg = void;
export type AuthRegisterApiResponse = /** status 201  */ MessageResponseDto;
export type AuthRegisterApiArg = {
	registerRequestDto: RegisterRequestDto;
};
export type AuthLoginApiResponse = /** status 200  */ UserResponseDto;
export type AuthLoginApiArg = {
	loginRequestDto: LoginRequestDto;
};
export type AuthLogoutApiResponse = /** status 200  */ MessageResponseDto;
export type AuthLogoutApiArg = void;
export type AuthResendVerificationApiResponse =
/** status 200  */ MessageResponseDto;
export type AuthResendVerificationApiArg = {
	emailRequestDto: EmailRequestDto;
};
export type AuthConfirmEmailApiResponse = /** status 200  */ MessageResponseDto;
export type AuthConfirmEmailApiArg = {
	tokenRequestDto: TokenRequestDto;
};
export type AuthRequestPasswordResetApiResponse =
/** status 200  */ MessageResponseDto;
export type AuthRequestPasswordResetApiArg = {
	emailRequestDto: EmailRequestDto;
};
export type AuthResetPasswordApiResponse =
/** status 200  */ MessageResponseDto;
export type AuthResetPasswordApiArg = {
	resetPasswordRequestDto: ResetPasswordRequestDto;
};
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
		status?: "ok" | "degraded";
		info?: {
			[key: string]: {
				status: "up" | "degraded" | "down";
				/** Time the health indicator took to respond, in ms */
				responseTime?: number;
				[key: string]: any;
			};
		} | null;
		error?: {
			[key: string]: {
				status: "up" | "degraded" | "down";
				/** Time the health indicator took to respond, in ms */
				responseTime?: number;
				[key: string]: any;
			};
		} | null;
		details?: {
			[key: string]: {
				status: "up" | "degraded" | "down";
				/** Time the health indicator took to respond, in ms */
				responseTime?: number;
				[key: string]: any;
			};
		};
	};
export type HealthCheckApiArg = void;
export type UserGetOwnUserApiResponse = /** status 200  */ UserResponseDto;
export type UserGetOwnUserApiArg = void;
export type UserUpdateProfileApiResponse = /** status 200  */ UserResponseDto;
export type UserUpdateProfileApiArg = {
	updateProfileRequestDto: UpdateProfileRequestDto;
};
export type UserChangePasswordApiResponse =
/** status 200  */ MessageResponseDto;
export type UserChangePasswordApiArg = {
	changePasswordRequestDto: ChangePasswordRequestDto;
};
export type UserResponseDto = {
	id: string;
	email: string;
	firstName?: string | null;
	lastName?: string | null;
};
export type MessageResponseDto = {
	message: string;
};
export type RegisterRequestDto = {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
};
export type LoginRequestDto = {
	email: string;
	password: string;
};
export type EmailRequestDto = {
	email: string;
};
export type TokenRequestDto = {
	token: string;
};
export type ResetPasswordRequestDto = {
	token: string;
	password: string;
};
export type GameMediaResponseDto = {
	type: "image" | "video";
	src: string;
	alt: string;
};
export type PublisherResponseDto = {
	id: string;
	name: string;
	slug: string;
	websiteUrl?: string;
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
	publisherList: PublisherResponseDto[];
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
export type UpdateProfileRequestDto = {
	firstName: string;
	lastName: string;
};
export type ChangePasswordRequestDto = {
	currentPassword: string;
	password: string;
};
export const {
	useAuthGetSessionQuery,
	useAuthRegisterMutation,
	useAuthLoginMutation,
	useAuthLogoutMutation,
	useAuthResendVerificationMutation,
	useAuthConfirmEmailMutation,
	useAuthRequestPasswordResetMutation,
	useAuthResetPasswordMutation,
	useGameGetGameListQuery,
	useGameGetFeaturedGameListQuery,
	useGameGetGameQuery,
	useHealthAliveQuery,
	useHealthCheckQuery,
	useUserGetOwnUserQuery,
	useUserUpdateProfileMutation,
	useUserChangePasswordMutation,
} = injectedRtkApi;

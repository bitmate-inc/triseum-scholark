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
		institutionGetInstitutionList: build.query<
			InstitutionGetInstitutionListApiResponse,
			InstitutionGetInstitutionListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/institution`,
				params: {
					status: queryArg.status,
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		institutionGetInstitutionBySlug: build.query<
			InstitutionGetInstitutionBySlugApiResponse,
			InstitutionGetInstitutionBySlugApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/institution/by-slug/${queryArg.slug}`,
			}),
		}),
		institutionGetInstitutionById: build.query<
			InstitutionGetInstitutionByIdApiResponse,
			InstitutionGetInstitutionByIdApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/institution/${queryArg.id}`,
			}),
		}),
		courseGetCourseList: build.query<
			CourseGetCourseListApiResponse,
			CourseGetCourseListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/course`,
				params: {
					institutionId: queryArg.institutionId,
					status: queryArg.status,
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		courseGetCourseBySlug: build.query<
			CourseGetCourseBySlugApiResponse,
			CourseGetCourseBySlugApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/course/by-slug/${queryArg.slug}`,
			}),
		}),
		courseGetCourseById: build.query<
			CourseGetCourseByIdApiResponse,
			CourseGetCourseByIdApiArg
		>({
			query: (queryArg) => ({ url: `/api/v1/catalog/course/${queryArg.id}` }),
		}),
		classroomGetClassroomList: build.query<
			ClassroomGetClassroomListApiResponse,
			ClassroomGetClassroomListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/classroom`,
				params: {
					institutionId: queryArg.institutionId,
					courseId: queryArg.courseId,
					taxonomyTermId: queryArg.taxonomyTermId,
					status: queryArg.status,
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		classroomGetClassroomBySlug: build.query<
			ClassroomGetClassroomBySlugApiResponse,
			ClassroomGetClassroomBySlugApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/classroom/by-slug/${queryArg.slug}`,
			}),
		}),
		classroomGetClassroomById: build.query<
			ClassroomGetClassroomByIdApiResponse,
			ClassroomGetClassroomByIdApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/classroom/${queryArg.id}`,
			}),
		}),
		classroomGameGetClassroomGameList: build.query<
			ClassroomGameGetClassroomGameListApiResponse,
			ClassroomGameGetClassroomGameListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/classroom-game`,
				params: {
					institutionId: queryArg.institutionId,
					classroomId: queryArg.classroomId,
					gameId: queryArg.gameId,
					taxonomyTermId: queryArg.taxonomyTermId,
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		classroomGameGetClassroomGameById: build.query<
			ClassroomGameGetClassroomGameByIdApiResponse,
			ClassroomGameGetClassroomGameByIdApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/classroom-game/${queryArg.id}`,
			}),
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
export type InstitutionGetInstitutionListApiResponse =
/** status 200  */ GetInstitutionListResponseDto;
export type InstitutionGetInstitutionListApiArg = {
	status?: EducationCatalogStatus;
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type InstitutionGetInstitutionBySlugApiResponse =
/** status 200  */ GetInstitutionResponseDto;
export type InstitutionGetInstitutionBySlugApiArg = {
	slug: string;
};
export type InstitutionGetInstitutionByIdApiResponse =
/** status 200  */ GetInstitutionResponseDto;
export type InstitutionGetInstitutionByIdApiArg = {
	id: string;
};
export type CourseGetCourseListApiResponse =
/** status 200  */ GetCourseListResponseDto;
export type CourseGetCourseListApiArg = {
	institutionId?: string;
	status?: EducationCatalogStatus;
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type CourseGetCourseBySlugApiResponse =
/** status 200  */ GetCourseResponseDto;
export type CourseGetCourseBySlugApiArg = {
	slug: string;
};
export type CourseGetCourseByIdApiResponse =
/** status 200  */ GetCourseResponseDto;
export type CourseGetCourseByIdApiArg = {
	id: string;
};
export type ClassroomGetClassroomListApiResponse =
/** status 200  */ GetClassroomListResponseDto;
export type ClassroomGetClassroomListApiArg = {
	institutionId?: string;
	courseId?: string;
	taxonomyTermId?: string;
	status?: EducationCatalogStatus;
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type ClassroomGetClassroomBySlugApiResponse =
/** status 200  */ GetClassroomResponseDto;
export type ClassroomGetClassroomBySlugApiArg = {
	slug: string;
};
export type ClassroomGetClassroomByIdApiResponse =
/** status 200  */ GetClassroomResponseDto;
export type ClassroomGetClassroomByIdApiArg = {
	id: string;
};
export type ClassroomGameGetClassroomGameListApiResponse =
/** status 200  */ GetClassroomGameListResponseDto;
export type ClassroomGameGetClassroomGameListApiArg = {
	institutionId?: string;
	classroomId?: string;
	gameId?: string;
	taxonomyTermId?: string;
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type ClassroomGameGetClassroomGameByIdApiResponse =
/** status 200  */ GetClassroomGameResponseDto;
export type ClassroomGameGetClassroomGameByIdApiArg = {
	id: string;
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
export type MediaResponseDto = {
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
	cover?: MediaResponseDto;
	publisherList: PublisherResponseDto[];
	taxonomyList: GameTaxonomyTermResponseDto[];
	estimatedLengthMinutesMin?: number;
	estimatedLengthMinutesMax?: number;
	featured?: boolean;
	mediaList?: MediaResponseDto[];
	publishedAt?: string;
};
export type GetGameListResponseDto = {
	gameList: GameResponseDto[];
	totalItemCount: number;
};
export type GetGameResponseDto = {
	game: GameResponseDto;
};
export type EducationCatalogStatus = "active" | "inactive";
export type InstitutionResponseDto = {
	id: string;
	name: string;
	slug: string;
	cover?: MediaResponseDto;
	summary?: string;
	description?: string;
	websiteUrl?: string;
	status: EducationCatalogStatus;
};
export type GetInstitutionListResponseDto = {
	institutionList: InstitutionResponseDto[];
	totalItemCount: number;
};
export type GetInstitutionResponseDto = {
	institution: InstitutionResponseDto;
};
export type CourseResponseDto = {
	id: string;
	institution: InstitutionResponseDto;
	name: string;
	code: string;
	slug: string;
	cover?: MediaResponseDto;
	summary?: string;
	description?: string;
	status: EducationCatalogStatus;
};
export type GetCourseListResponseDto = {
	courseList: CourseResponseDto[];
	totalItemCount: number;
};
export type GetCourseResponseDto = {
	course: CourseResponseDto;
};
export type ClassroomCourseResponseDto = {
	id: string;
	name: string;
	code: string;
	slug: string;
};
export type ClassroomInstructorResponseDto = {
	id: string;
	name: string;
	slug: string;
};
export type ClassroomTaxonomyTermResponseDto = {
	id: string;
	type: TaxonomyType;
	label: string;
	slug: string;
};
export type ClassroomResponseDto = {
	id: string;
	institution: InstitutionResponseDto;
	name: string;
	code: string;
	slug: string;
	cover?: MediaResponseDto;
	summary?: string;
	description?: string;
	status: EducationCatalogStatus;
	courseList: ClassroomCourseResponseDto[];
	instructorList: ClassroomInstructorResponseDto[];
	taxonomyTermList: ClassroomTaxonomyTermResponseDto[];
};
export type GetClassroomListResponseDto = {
	classroomList: ClassroomResponseDto[];
	totalItemCount: number;
};
export type GetClassroomResponseDto = {
	classroom: ClassroomResponseDto;
};
export type ClassroomGameClassroomResponseDto = {
	id: string;
	name: string;
	slug: string;
	institution: InstitutionResponseDto;
};
export type ClassroomGameResponseDto = {
	id: string;
	classroom: ClassroomGameClassroomResponseDto;
	game: GameResponseDto;
	createdAt: string;
	updatedAt: string;
};
export type GetClassroomGameListResponseDto = {
	classroomGameList: ClassroomGameResponseDto[];
	totalItemCount: number;
};
export type GetClassroomGameResponseDto = {
	classroomGame: ClassroomGameResponseDto;
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
	useInstitutionGetInstitutionListQuery,
	useInstitutionGetInstitutionBySlugQuery,
	useInstitutionGetInstitutionByIdQuery,
	useCourseGetCourseListQuery,
	useCourseGetCourseBySlugQuery,
	useCourseGetCourseByIdQuery,
	useClassroomGetClassroomListQuery,
	useClassroomGetClassroomBySlugQuery,
	useClassroomGetClassroomByIdQuery,
	useClassroomGameGetClassroomGameListQuery,
	useClassroomGameGetClassroomGameByIdQuery,
	useHealthAliveQuery,
	useHealthCheckQuery,
	useUserGetOwnUserQuery,
	useUserUpdateProfileMutation,
	useUserChangePasswordMutation,
} = injectedRtkApi;

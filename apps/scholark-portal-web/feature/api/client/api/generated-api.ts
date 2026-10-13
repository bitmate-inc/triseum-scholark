import { api } from "./api-base";
const injectedRtkApi = api.injectEndpoints({
	endpoints: (build) => ({
		adminGetSession: build.query<
			AdminGetSessionApiResponse,
			AdminGetSessionApiArg
		>({
			query: () => ({ url: `/api/v1/admin/session` }),
		}),
		adminGetInstitutionList: build.query<
			AdminGetInstitutionListApiResponse,
			AdminGetInstitutionListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/institutions`,
				params: {
					status: queryArg.status,
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		adminCreateInstitution: build.mutation<
			AdminCreateInstitutionApiResponse,
			AdminCreateInstitutionApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/institutions`,
				method: "POST",
				body: queryArg.createAdminInstitutionRequestDto,
			}),
		}),
		adminGetInstitutionById: build.query<
			AdminGetInstitutionByIdApiResponse,
			AdminGetInstitutionByIdApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/institutions/${queryArg.id}`,
			}),
		}),
		adminUpdateInstitution: build.mutation<
			AdminUpdateInstitutionApiResponse,
			AdminUpdateInstitutionApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/institutions/${queryArg.id}`,
				method: "PATCH",
				body: queryArg.updateAdminInstitutionRequestDto,
			}),
		}),
		adminGetClassroomList: build.query<
			AdminGetClassroomListApiResponse,
			AdminGetClassroomListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/classrooms`,
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
		adminCreateClassroom: build.mutation<
			AdminCreateClassroomApiResponse,
			AdminCreateClassroomApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/classrooms`,
				method: "POST",
				body: queryArg.createAdminClassroomRequestDto,
			}),
		}),
		adminGetClassroomById: build.query<
			AdminGetClassroomByIdApiResponse,
			AdminGetClassroomByIdApiArg
		>({
			query: (queryArg) => ({ url: `/api/v1/admin/classrooms/${queryArg.id}` }),
		}),
		adminUpdateClassroom: build.mutation<
			AdminUpdateClassroomApiResponse,
			AdminUpdateClassroomApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/classrooms/${queryArg.id}`,
				method: "PATCH",
				body: queryArg.updateAdminClassroomRequestDto,
			}),
		}),
		adminCreateClassroomGameListing: build.mutation<
			AdminCreateClassroomGameListingApiResponse,
			AdminCreateClassroomGameListingApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/classroom-game-listings`,
				method: "POST",
				body: queryArg.createAdminClassroomGameListingRequestDto,
			}),
		}),
		adminGetClassroomGameListingList: build.query<
			AdminGetClassroomGameListingListApiResponse,
			AdminGetClassroomGameListingListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/classroom-game-listings`,
				params: {
					institutionId: queryArg.institutionId,
					classroomId: queryArg.classroomId,
					gameId: queryArg.gameId,
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		adminGetClassroomGameListingById: build.query<
			AdminGetClassroomGameListingByIdApiResponse,
			AdminGetClassroomGameListingByIdApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/classroom-game-listings/${queryArg.id}`,
			}),
		}),
		adminUpdateClassroomGameListing: build.mutation<
			AdminUpdateClassroomGameListingApiResponse,
			AdminUpdateClassroomGameListingApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/classroom-game-listings/${queryArg.id}`,
				method: "PATCH",
				body: queryArg.updateAdminClassroomGameListingRequestDto,
			}),
		}),
		adminGetInstructorList: build.query<
			AdminGetInstructorListApiResponse,
			AdminGetInstructorListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/instructors`,
				params: {
					institutionId: queryArg.institutionId,
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		adminCreateInstructor: build.mutation<
			AdminCreateInstructorApiResponse,
			AdminCreateInstructorApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/instructors`,
				method: "POST",
				body: queryArg.createAdminInstructorRequestDto,
			}),
		}),
		adminGetInstructorById: build.query<
			AdminGetInstructorByIdApiResponse,
			AdminGetInstructorByIdApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/instructors/${queryArg.id}`,
			}),
		}),
		adminUpdateInstructor: build.mutation<
			AdminUpdateInstructorApiResponse,
			AdminUpdateInstructorApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/instructors/${queryArg.id}`,
				method: "PATCH",
				body: queryArg.updateAdminInstructorRequestDto,
			}),
		}),
		adminGetPublisherList: build.query<
			AdminGetPublisherListApiResponse,
			AdminGetPublisherListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/publishers`,
				params: {
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		adminCreatePublisher: build.mutation<
			AdminCreatePublisherApiResponse,
			AdminCreatePublisherApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/publishers`,
				method: "POST",
				body: queryArg.createAdminPublisherRequestDto,
			}),
		}),
		adminUpdatePublisher: build.mutation<
			AdminUpdatePublisherApiResponse,
			AdminUpdatePublisherApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/publishers/${queryArg.id}`,
				method: "PATCH",
				body: queryArg.updateAdminPublisherRequestDto,
			}),
		}),
		adminGetPublisherById: build.query<
			AdminGetPublisherByIdApiResponse,
			AdminGetPublisherByIdApiArg
		>({
			query: (queryArg) => ({ url: `/api/v1/admin/publishers/${queryArg.id}` }),
		}),
		adminGetGameList: build.query<
			AdminGetGameListApiResponse,
			AdminGetGameListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/games`,
				params: {
					publisherId: queryArg.publisherId,
					publication: queryArg.publication,
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		adminCreateGame: build.mutation<
			AdminCreateGameApiResponse,
			AdminCreateGameApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/games`,
				method: "POST",
				body: queryArg.createAdminGameRequestDto,
			}),
		}),
		adminUpdateGame: build.mutation<
			AdminUpdateGameApiResponse,
			AdminUpdateGameApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/games/${queryArg.id}`,
				method: "PATCH",
				body: queryArg.updateAdminGameRequestDto,
			}),
		}),
		adminGetGameById: build.query<
			AdminGetGameByIdApiResponse,
			AdminGetGameByIdApiArg
		>({
			query: (queryArg) => ({ url: `/api/v1/admin/games/${queryArg.id}` }),
		}),
		adminCreateGameVersion: build.mutation<
			AdminCreateGameVersionApiResponse,
			AdminCreateGameVersionApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/games/${queryArg.id}/versions`,
				method: "POST",
				body: queryArg.createAdminGameVersionRequestDto,
			}),
		}),
		adminUpdateGameVersion: build.mutation<
			AdminUpdateGameVersionApiResponse,
			AdminUpdateGameVersionApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/games/${queryArg.id}/versions/${queryArg.versionId}`,
				method: "PATCH",
				body: queryArg.updateAdminGameVersionRequestDto,
			}),
		}),
		adminCreatePublicGameListing: build.mutation<
			AdminCreatePublicGameListingApiResponse,
			AdminCreatePublicGameListingApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/games/${queryArg.id}/public-listings`,
				method: "POST",
				body: queryArg.createAdminPublicGameListingRequestDto,
			}),
		}),
		adminUpdatePublicGameListing: build.mutation<
			AdminUpdatePublicGameListingApiResponse,
			AdminUpdatePublicGameListingApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/games/${queryArg.id}/public-listings/${queryArg.listingId}`,
				method: "PATCH",
				body: queryArg.updateAdminPublicGameListingRequestDto,
			}),
		}),
		adminGetGameListingList: build.query<
			AdminGetGameListingListApiResponse,
			AdminGetGameListingListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/game-listings`,
				params: {
					type: queryArg["type"],
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		adminGetTaxonomyTermList: build.query<
			AdminGetTaxonomyTermListApiResponse,
			AdminGetTaxonomyTermListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/taxonomy`,
				params: {
					type: queryArg["type"],
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		adminCreateTaxonomyTerm: build.mutation<
			AdminCreateTaxonomyTermApiResponse,
			AdminCreateTaxonomyTermApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/taxonomy`,
				method: "POST",
				body: queryArg.createAdminTaxonomyTermRequestDto,
			}),
		}),
		adminUpdateTaxonomyTerm: build.mutation<
			AdminUpdateTaxonomyTermApiResponse,
			AdminUpdateTaxonomyTermApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/taxonomy/${queryArg.id}`,
				method: "PATCH",
				body: queryArg.updateAdminTaxonomyTermRequestDto,
			}),
		}),
		adminGetUserList: build.query<
			AdminGetUserListApiResponse,
			AdminGetUserListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/users`,
				params: {
					status: queryArg.status,
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		adminGetAcquisitionList: build.query<
			AdminGetAcquisitionListApiResponse,
			AdminGetAcquisitionListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/billing/acquisitions`,
				params: {
					mechanism: queryArg.mechanism,
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		adminGetAcquisition: build.query<
			AdminGetAcquisitionApiResponse,
			AdminGetAcquisitionApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/billing/acquisitions/${queryArg.id}`,
			}),
		}),
		adminGetPaymentAttemptList: build.query<
			AdminGetPaymentAttemptListApiResponse,
			AdminGetPaymentAttemptListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/billing/payment-attempts`,
				params: {
					status: queryArg.status,
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		adminGetLicenseList: build.query<
			AdminGetLicenseListApiResponse,
			AdminGetLicenseListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/billing/licenses`,
				params: {
					status: queryArg.status,
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		adminGetAcquisitionCodeList: build.query<
			AdminGetAcquisitionCodeListApiResponse,
			AdminGetAcquisitionCodeListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/billing/acquisition-codes`,
				params: {
					institutionId: queryArg.institutionId,
					limit: queryArg.limit,
					offset: queryArg.offset,
					q: queryArg.q,
					id: queryArg.id,
				},
			}),
		}),
		adminGetAcquisitionCode: build.query<
			AdminGetAcquisitionCodeApiResponse,
			AdminGetAcquisitionCodeApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/acquisition-codes/${queryArg.id}`,
			}),
		}),
		adminCreateAcquisitionCodes: build.mutation<
			AdminCreateAcquisitionCodesApiResponse,
			AdminCreateAcquisitionCodesApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/acquisition-codes`,
				method: "POST",
				body: queryArg.createAdminAcquisitionCodesRequestDto,
			}),
		}),
		adminRevokeAcquisitionCode: build.mutation<
			AdminRevokeAcquisitionCodeApiResponse,
			AdminRevokeAcquisitionCodeApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/acquisition-codes/${queryArg.id}/revoke`,
				method: "PATCH",
				body: queryArg.revokeAdminAcquisitionCodeRequestDto,
			}),
		}),
		adminGetCourseList: build.query<
			AdminGetCourseListApiResponse,
			AdminGetCourseListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/courses`,
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
		adminCreateCourse: build.mutation<
			AdminCreateCourseApiResponse,
			AdminCreateCourseApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/courses`,
				method: "POST",
				body: queryArg.createAdminCourseRequestDto,
			}),
		}),
		adminGetCourseById: build.query<
			AdminGetCourseByIdApiResponse,
			AdminGetCourseByIdApiArg
		>({
			query: (queryArg) => ({ url: `/api/v1/admin/courses/${queryArg.id}` }),
		}),
		adminUpdateCourse: build.mutation<
			AdminUpdateCourseApiResponse,
			AdminUpdateCourseApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/admin/courses/${queryArg.id}`,
				method: "PATCH",
				body: queryArg.updateAdminCourseRequestDto,
			}),
		}),
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
		gameAcquireGame: build.mutation<
			GameAcquireGameApiResponse,
			GameAcquireGameApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/game/acquisition`,
				method: "POST",
				body: queryArg.gameAcquisitionRequestDto,
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
		classroomGameListingRedeemAcquisitionCode: build.mutation<
			ClassroomGameListingRedeemAcquisitionCodeApiResponse,
			ClassroomGameListingRedeemAcquisitionCodeApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/classroom-game-listing/${queryArg.id}/redeem-code`,
				method: "POST",
				body: queryArg.redeemAcquisitionCodeRequestDto,
			}),
		}),
		classroomGameListingAcquireClassroomGameListing: build.mutation<
			ClassroomGameListingAcquireClassroomGameListingApiResponse,
			ClassroomGameListingAcquireClassroomGameListingApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/classroom-game-listing/${queryArg.id}/acquisition`,
				method: "POST",
			}),
		}),
		classroomGameListingGetClassroomGameListingList: build.query<
			ClassroomGameListingGetClassroomGameListingListApiResponse,
			ClassroomGameListingGetClassroomGameListingListApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/classroom-game-listing`,
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
		classroomGameListingGetClassroomGameListingById: build.query<
			ClassroomGameListingGetClassroomGameListingByIdApiResponse,
			ClassroomGameListingGetClassroomGameListingByIdApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/catalog/classroom-game-listing/${queryArg.id}`,
			}),
		}),
		stripeWebhookProcessWebhook: build.mutation<
			StripeWebhookProcessWebhookApiResponse,
			StripeWebhookProcessWebhookApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/stripe/webhook`,
				method: "POST",
				headers: {
					"stripe-signature": queryArg["stripe-signature"],
				},
			}),
		}),
		healthAlive: build.query<HealthAliveApiResponse, HealthAliveApiArg>({
			query: () => ({ url: `/api/v1/health/alive` }),
		}),
		healthCheck: build.query<HealthCheckApiResponse, HealthCheckApiArg>({
			query: () => ({ url: `/api/v1/health/status` }),
		}),
		userGetLibrary: build.query<
			UserGetLibraryApiResponse,
			UserGetLibraryApiArg
		>({
			query: () => ({ url: `/api/v1/user/me/library` }),
		}),
		userLaunchGame: build.mutation<
			UserLaunchGameApiResponse,
			UserLaunchGameApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/user/me/library/${queryArg.licenseId}/launch`,
				method: "POST",
			}),
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
		userGetCheckoutStatus: build.query<
			UserGetCheckoutStatusApiResponse,
			UserGetCheckoutStatusApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/user/me/checkout-status`,
				params: {
					checkoutSessionId: queryArg.checkoutSessionId,
				},
			}),
		}),
		userGetPaymentAttempts: build.query<
			UserGetPaymentAttemptsApiResponse,
			UserGetPaymentAttemptsApiArg
		>({
			query: () => ({ url: `/api/v1/user/me/payment-attempts` }),
		}),
		userRevalidatePaymentAttempt: build.mutation<
			UserRevalidatePaymentAttemptApiResponse,
			UserRevalidatePaymentAttemptApiArg
		>({
			query: (queryArg) => ({
				url: `/api/v1/user/me/payment-attempts/${queryArg.id}/revalidate`,
				method: "POST",
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
export type AdminGetSessionApiResponse = /** status 200  */ UserResponseDto;
export type AdminGetSessionApiArg = void;
export type AdminGetInstitutionListApiResponse =
/** status 200  */ GetInstitutionListResponseDto;
export type AdminGetInstitutionListApiArg = {
	status?: EducationCatalogStatus;
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type AdminCreateInstitutionApiResponse =
/** status 201  */ GetInstitutionResponseDto;
export type AdminCreateInstitutionApiArg = {
	createAdminInstitutionRequestDto: CreateAdminInstitutionRequestDto;
};
export type AdminGetInstitutionByIdApiResponse =
/** status 200  */ GetInstitutionResponseDto;
export type AdminGetInstitutionByIdApiArg = {
	id: string;
};
export type AdminUpdateInstitutionApiResponse =
/** status 200  */ GetInstitutionResponseDto;
export type AdminUpdateInstitutionApiArg = {
	id: string;
	updateAdminInstitutionRequestDto: UpdateAdminInstitutionRequestDto;
};
export type AdminGetClassroomListApiResponse =
/** status 200  */ GetAdminClassroomListResponseDto;
export type AdminGetClassroomListApiArg = {
	institutionId?: string;
	courseId?: string;
	taxonomyTermId?: string;
	status?: EducationCatalogStatus;
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type AdminCreateClassroomApiResponse =
/** status 201  */ GetClassroomResponseDto;
export type AdminCreateClassroomApiArg = {
	createAdminClassroomRequestDto: CreateAdminClassroomRequestDto;
};
export type AdminGetClassroomByIdApiResponse =
/** status 200  */ GetClassroomResponseDto;
export type AdminGetClassroomByIdApiArg = {
	id: string;
};
export type AdminUpdateClassroomApiResponse =
/** status 200  */ GetClassroomResponseDto;
export type AdminUpdateClassroomApiArg = {
	id: string;
	updateAdminClassroomRequestDto: UpdateAdminClassroomRequestDto;
};
export type AdminCreateClassroomGameListingApiResponse =
/** status 201  */ GetAdminClassroomGameListingResponseDto;
export type AdminCreateClassroomGameListingApiArg = {
	createAdminClassroomGameListingRequestDto: CreateAdminClassroomGameListingRequestDto;
};
export type AdminGetClassroomGameListingListApiResponse =
/** status 200  */ GetAdminClassroomGameListingListResponseDto;
export type AdminGetClassroomGameListingListApiArg = {
	institutionId?: string;
	classroomId?: string;
	gameId?: string;
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type AdminGetClassroomGameListingByIdApiResponse =
/** status 200  */ GetAdminClassroomGameListingResponseDto;
export type AdminGetClassroomGameListingByIdApiArg = {
	id: string;
};
export type AdminUpdateClassroomGameListingApiResponse =
/** status 200  */ GetAdminClassroomGameListingResponseDto;
export type AdminUpdateClassroomGameListingApiArg = {
	id: string;
	updateAdminClassroomGameListingRequestDto: UpdateAdminClassroomGameListingRequestDto;
};
export type AdminGetInstructorListApiResponse =
/** status 200  */ GetAdminInstructorListResponseDto;
export type AdminGetInstructorListApiArg = {
	institutionId?: string;
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type AdminCreateInstructorApiResponse =
/** status 201  */ GetAdminInstructorResponseDto;
export type AdminCreateInstructorApiArg = {
	createAdminInstructorRequestDto: CreateAdminInstructorRequestDto;
};
export type AdminGetInstructorByIdApiResponse =
/** status 200  */ GetAdminInstructorResponseDto;
export type AdminGetInstructorByIdApiArg = {
	id: string;
};
export type AdminUpdateInstructorApiResponse =
/** status 200  */ GetAdminInstructorResponseDto;
export type AdminUpdateInstructorApiArg = {
	id: string;
	updateAdminInstructorRequestDto: UpdateAdminInstructorRequestDto;
};
export type AdminGetPublisherListApiResponse =
/** status 200  */ GetAdminPublisherListResponseDto;
export type AdminGetPublisherListApiArg = {
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type AdminCreatePublisherApiResponse =
/** status 201  */ GetAdminPublisherResponseDto;
export type AdminCreatePublisherApiArg = {
	createAdminPublisherRequestDto: CreateAdminPublisherRequestDto;
};
export type AdminUpdatePublisherApiResponse =
/** status 200  */ GetAdminPublisherResponseDto;
export type AdminUpdatePublisherApiArg = {
	id: string;
	updateAdminPublisherRequestDto: UpdateAdminPublisherRequestDto;
};
export type AdminGetPublisherByIdApiResponse =
/** status 200  */ GetAdminPublisherResponseDto;
export type AdminGetPublisherByIdApiArg = {
	id: string;
};
export type AdminGetGameListApiResponse =
/** status 200  */ GetAdminGameListResponseDto;
export type AdminGetGameListApiArg = {
	publisherId?: string;
	publication?: "published" | "unpublished" | "scheduled";
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type AdminCreateGameApiResponse =
/** status 201  */ GetAdminGameResponseDto;
export type AdminCreateGameApiArg = {
	createAdminGameRequestDto: CreateAdminGameRequestDto;
};
export type AdminUpdateGameApiResponse =
/** status 200  */ GetAdminGameResponseDto;
export type AdminUpdateGameApiArg = {
	id: string;
	updateAdminGameRequestDto: UpdateAdminGameRequestDto;
};
export type AdminGetGameByIdApiResponse =
/** status 200  */ GetAdminGameResponseDto;
export type AdminGetGameByIdApiArg = {
	id: string;
};
export type AdminCreateGameVersionApiResponse =
/** status 201  */ GetAdminGameResponseDto;
export type AdminCreateGameVersionApiArg = {
	id: string;
	createAdminGameVersionRequestDto: CreateAdminGameVersionRequestDto;
};
export type AdminUpdateGameVersionApiResponse =
/** status 200  */ GetAdminGameResponseDto;
export type AdminUpdateGameVersionApiArg = {
	id: string;
	versionId: string;
	updateAdminGameVersionRequestDto: UpdateAdminGameVersionRequestDto;
};
export type AdminCreatePublicGameListingApiResponse =
/** status 201  */ GetAdminGameResponseDto;
export type AdminCreatePublicGameListingApiArg = {
	id: string;
	createAdminPublicGameListingRequestDto: CreateAdminPublicGameListingRequestDto;
};
export type AdminUpdatePublicGameListingApiResponse =
/** status 200  */ GetAdminGameResponseDto;
export type AdminUpdatePublicGameListingApiArg = {
	id: string;
	listingId: string;
	updateAdminPublicGameListingRequestDto: UpdateAdminPublicGameListingRequestDto;
};
export type AdminGetGameListingListApiResponse =
/** status 200  */ GetAdminGameListingListResponseDto;
export type AdminGetGameListingListApiArg = {
	type: "public" | "classroom";
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type AdminGetTaxonomyTermListApiResponse =
/** status 200  */ GetAdminTaxonomyTermListResponseDto;
export type AdminGetTaxonomyTermListApiArg = {
	type?: TaxonomyType;
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type AdminCreateTaxonomyTermApiResponse =
/** status 201  */ AdminTaxonomyTermResponseDto;
export type AdminCreateTaxonomyTermApiArg = {
	createAdminTaxonomyTermRequestDto: CreateAdminTaxonomyTermRequestDto;
};
export type AdminUpdateTaxonomyTermApiResponse =
/** status 200  */ AdminTaxonomyTermResponseDto;
export type AdminUpdateTaxonomyTermApiArg = {
	id: string;
	updateAdminTaxonomyTermRequestDto: UpdateAdminTaxonomyTermRequestDto;
};
export type AdminGetUserListApiResponse =
/** status 200  */ GetAdminUserListResponseDto;
export type AdminGetUserListApiArg = {
	status?: UserStatus;
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type AdminGetAcquisitionListApiResponse =
/** status 200  */ GetAdminAcquisitionListResponseDto;
export type AdminGetAcquisitionListApiArg = {
	mechanism?: GameAcquisitionMechanism;
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type AdminGetAcquisitionApiResponse =
/** status 200  */ GetAdminAcquisitionDetailResponseDto;
export type AdminGetAcquisitionApiArg = {
	id: string;
};
export type AdminGetPaymentAttemptListApiResponse =
/** status 200  */ GetAdminPaymentAttemptListResponseDto;
export type AdminGetPaymentAttemptListApiArg = {
	status?: GamePaymentAttemptStatus;
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type AdminGetLicenseListApiResponse =
/** status 200  */ GetAdminLicenseListResponseDto;
export type AdminGetLicenseListApiArg = {
	status?: "active" | "scheduled" | "expired";
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type AdminGetAcquisitionCodeListApiResponse =
/** status 200  */ GetAdminAcquisitionCodeListResponseDto;
export type AdminGetAcquisitionCodeListApiArg = {
	institutionId?: string;
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type AdminGetAcquisitionCodeApiResponse =
/** status 200  */ AdminAcquisitionCodeListItemResponseDto;
export type AdminGetAcquisitionCodeApiArg = {
	id: string;
};
export type AdminCreateAcquisitionCodesApiResponse =
/** status 201  */ CreateAdminAcquisitionCodesResponseDto;
export type AdminCreateAcquisitionCodesApiArg = {
	createAdminAcquisitionCodesRequestDto: CreateAdminAcquisitionCodesRequestDto;
};
export type AdminRevokeAcquisitionCodeApiResponse = unknown;
export type AdminRevokeAcquisitionCodeApiArg = {
	id: string;
	revokeAdminAcquisitionCodeRequestDto: RevokeAdminAcquisitionCodeRequestDto;
};
export type AdminGetCourseListApiResponse =
/** status 200  */ GetCourseListResponseDto;
export type AdminGetCourseListApiArg = {
	institutionId?: string;
	status?: EducationCatalogStatus;
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type AdminCreateCourseApiResponse =
/** status 201  */ GetCourseResponseDto;
export type AdminCreateCourseApiArg = {
	createAdminCourseRequestDto: CreateAdminCourseRequestDto;
};
export type AdminGetCourseByIdApiResponse =
/** status 200  */ GetCourseResponseDto;
export type AdminGetCourseByIdApiArg = {
	id: string;
};
export type AdminUpdateCourseApiResponse =
/** status 200  */ GetCourseResponseDto;
export type AdminUpdateCourseApiArg = {
	id: string;
	updateAdminCourseRequestDto: UpdateAdminCourseRequestDto;
};
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
export type GameAcquireGameApiResponse =
/** status 200  */ GameCheckoutResponseDto;
export type GameAcquireGameApiArg = {
	gameAcquisitionRequestDto: GameAcquisitionRequestDto;
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
export type ClassroomGameListingRedeemAcquisitionCodeApiResponse =
/** status 200  */ RedeemAcquisitionCodeResponseDto;
export type ClassroomGameListingRedeemAcquisitionCodeApiArg = {
	id: string;
	redeemAcquisitionCodeRequestDto: RedeemAcquisitionCodeRequestDto;
};
export type ClassroomGameListingAcquireClassroomGameListingApiResponse =
/** status 200  */ GameCheckoutResponseDto;
export type ClassroomGameListingAcquireClassroomGameListingApiArg = {
	id: string;
};
export type ClassroomGameListingGetClassroomGameListingListApiResponse =
/** status 200  */ GetClassroomGameListingListResponseDto;
export type ClassroomGameListingGetClassroomGameListingListApiArg = {
	institutionId?: string;
	classroomId?: string;
	gameId?: string;
	taxonomyTermId?: string;
	limit?: number;
	offset?: number;
	q?: string;
	id?: string[];
};
export type ClassroomGameListingGetClassroomGameListingByIdApiResponse =
/** status 200  */ GetClassroomGameListingResponseDto;
export type ClassroomGameListingGetClassroomGameListingByIdApiArg = {
	id: string;
};
export type StripeWebhookProcessWebhookApiResponse = unknown;
export type StripeWebhookProcessWebhookApiArg = {
	"stripe-signature": string;
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
export type UserGetLibraryApiResponse =
/** status 200  */ UserLibraryResponseDto;
export type UserGetLibraryApiArg = void;
export type UserLaunchGameApiResponse =
/** status 201  */ GameLaunchResponseDto;
export type UserLaunchGameApiArg = {
	licenseId: string;
};
export type UserGetOwnUserApiResponse = /** status 200  */ UserResponseDto;
export type UserGetOwnUserApiArg = void;
export type UserUpdateProfileApiResponse = /** status 200  */ UserResponseDto;
export type UserUpdateProfileApiArg = {
	updateProfileRequestDto: UpdateProfileRequestDto;
};
export type UserGetCheckoutStatusApiResponse =
/** status 200  */ GameCheckoutStatusResponseDto;
export type UserGetCheckoutStatusApiArg = {
	checkoutSessionId: string;
};
export type UserGetPaymentAttemptsApiResponse =
/** status 200  */ UserPaymentAttemptListResponseDto;
export type UserGetPaymentAttemptsApiArg = void;
export type UserRevalidatePaymentAttemptApiResponse =
/** status 200  */ GameCheckoutStatusResponseDto;
export type UserRevalidatePaymentAttemptApiArg = {
	id: string;
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
export type MediaResponseDto = {
	type: "image" | "video";
	src: string;
	alt: string;
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
export type CreateAdminInstitutionRequestDto = {
	description?: string;
	name: string;
	slug: string;
	summary?: string;
	websiteUrl?: string;
};
export type UpdateAdminInstitutionRequestDto = {
	description?: string;
	name?: string;
	slug?: string;
	status?: EducationCatalogStatus;
	summary?: string;
	websiteUrl?: string;
};
export type AdminClassroomListItemResponseDto = {
	id: string;
	institution: InstitutionResponseDto;
	name: string;
	code: string;
	slug: string;
	language: string;
	courseType: "standard" | "game-based";
	status: EducationCatalogStatus;
};
export type GetAdminClassroomListResponseDto = {
	classroomList: AdminClassroomListItemResponseDto[];
	totalItemCount: number;
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
export type TaxonomyType = "category" | "genre" | "skill" | "subject" | "theme";
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
	language: string;
	courseType: "standard" | "game-based";
	cover?: MediaResponseDto;
	summary?: string;
	description?: string;
	status: EducationCatalogStatus;
	courseList: ClassroomCourseResponseDto[];
	instructorList: ClassroomInstructorResponseDto[];
	taxonomyTermList: ClassroomTaxonomyTermResponseDto[];
};
export type GetClassroomResponseDto = {
	classroom: ClassroomResponseDto;
};
export type CreateAdminClassroomRequestDto = {
	code: string;
	courseType: "standard" | "game-based";
	courseIdList?: string[];
	description?: string;
	institutionId: string;
	language: string;
	instructorIdList?: string[];
	name: string;
	slug: string;
	summary?: string;
	taxonomyTermIdList?: string[];
};
export type UpdateAdminClassroomRequestDto = {
	code?: string;
	courseType?: "standard" | "game-based";
	courseIdList?: string[];
	description?: string;
	institutionId?: string;
	language?: string;
	instructorIdList?: string[];
	name?: string;
	slug?: string;
	status?: EducationCatalogStatus;
	summary?: string;
	taxonomyTermIdList?: string[];
};
export type AdminClassroomGameListingInstitutionResponseDto = {
	id: string;
	name: string;
	slug: string;
};
export type AdminClassroomGameListingPublisherResponseDto = {
	id: string;
	name: string;
	slug: string;
};
export type ClassroomGameListingDesignatedPayor = "student" | "institution";
export type MoneyDto = {
	minorUnitAmount: number;
	currency: "USD";
};
export type AdminClassroomGameListingResponseDto = {
	id: string;
	institution: AdminClassroomGameListingInstitutionResponseDto;
	classroomId: string;
	classroomName: string;
	classroomSlug: string;
	gameId: string;
	gameTitle: string;
	gameSlug: string;
	publisher: AdminClassroomGameListingPublisherResponseDto;
	gameVersionId: string;
	publisherVersion: string;
	designatedPayor: ClassroomGameListingDesignatedPayor;
	price?: MoneyDto;
	includedLicenseQuantity?: number;
	customizationId?: string;
	licenseDurationDays: number;
	language: string;
	courseType: string;
	startAt: string;
	endAt: string;
	publishedAt?: string;
	gamePublishedAt?: string;
};
export type GetAdminClassroomGameListingResponseDto = {
	classroomGameListing: AdminClassroomGameListingResponseDto;
};
export type AdminGameListingPriceRequestDto = {
	minorUnitAmount: number;
	currency: "USD";
};
export type CreateAdminClassroomGameListingRequestDto = {
	classroomId: string;
	gameVersionId: string;
	designatedPayor: "student" | "institution";
	price?: AdminGameListingPriceRequestDto;
	includedLicenseQuantity?: number;
	licenseDurationDays: number;
	customizationId?: string;
	startAt: string;
	endAt: string;
	publishedAt?: string;
};
export type GetAdminClassroomGameListingListResponseDto = {
	classroomGameListingList: AdminClassroomGameListingResponseDto[];
	totalItemCount: number;
};
export type UpdateAdminClassroomGameListingRequestDto = {
	classroomId?: string;
	gameVersionId?: string;
	designatedPayor?: "student" | "institution";
	price?: AdminGameListingPriceRequestDto | null;
	includedLicenseQuantity?: number | null;
	licenseDurationDays?: number;
	customizationId?: string | null;
	startAt?: string;
	endAt?: string;
	publishedAt?: string | null;
};
export type AdminInstructorListItemResponseDto = {
	id: string;
	name: string;
	slug: string;
};
export type GetAdminInstructorListResponseDto = {
	instructorList: AdminInstructorListItemResponseDto[];
	totalItemCount: number;
};
export type AdminInstructorInstitutionResponseDto = {
	id: string;
	name: string;
	slug: string;
};
export type AdminInstructorClassroomResponseDto = {
	id: string;
	name: string;
	code: string;
	slug: string;
	institution: AdminInstructorInstitutionResponseDto;
};
export type AdminInstructorResponseDto = {
	id: string;
	name: string;
	slug: string;
	institutionList: AdminInstructorInstitutionResponseDto[];
	classroomList: AdminInstructorClassroomResponseDto[];
};
export type GetAdminInstructorResponseDto = {
	instructor: AdminInstructorResponseDto;
};
export type CreateAdminInstructorRequestDto = {
	classroomIdList?: string[];
	institutionIdList?: string[];
	name: string;
	slug: string;
};
export type UpdateAdminInstructorRequestDto = {
	classroomIdList?: string[];
	institutionIdList?: string[];
	name?: string;
	slug?: string;
};
export type AdminPublisherListItemResponseDto = {
	id: string;
	name: string;
	slug: string;
	websiteUrl?: string;
};
export type GetAdminPublisherListResponseDto = {
	publisherList: AdminPublisherListItemResponseDto[];
	totalItemCount: number;
};
export type AdminPublisherGameVersionResponseDto = {
	id: string;
	publisherVersion: string;
	description?: string;
	runUrl: string;
	publishedAt?: string;
};
export type AdminPublisherGameResponseDto = {
	id: string;
	title: string;
	slug: string;
	summary?: string;
	publishedAt?: string;
	gameVersionList: AdminPublisherGameVersionResponseDto[];
};
export type AdminPublisherResponseDto = {
	id: string;
	name: string;
	slug: string;
	websiteUrl?: string;
	gameList: AdminPublisherGameResponseDto[];
};
export type GetAdminPublisherResponseDto = {
	publisher: AdminPublisherResponseDto;
};
export type CreateAdminPublisherRequestDto = {
	name: string;
	slug: string;
	websiteUrl?: string;
};
export type UpdateAdminPublisherRequestDto = {
	name?: string;
	slug?: string;
	websiteUrl?: string;
};
export type AdminGamePublisherResponseDto = {
	id: string;
	name: string;
	slug: string;
};
export type AdminGameListItemResponseDto = {
	id: string;
	title: string;
	slug: string;
	publisher: AdminGamePublisherResponseDto;
	publishedAt?: string;
	featured?: boolean;
};
export type GetAdminGameListResponseDto = {
	gameList: AdminGameListItemResponseDto[];
	totalItemCount: number;
};
export type AdminGamePublicListingPriceGroupResponseDto = {
	id: string;
	price: MoneyDto;
	languageList: string[];
};
export type AdminGamePublicListingResponseDto = {
	id: string;
	priceGroupList: AdminGamePublicListingPriceGroupResponseDto[];
	available: boolean;
	publishedAt?: string;
	startAt: string;
	endAt?: string;
};
export type AdminGameVersionResponseDto = {
	id: string;
	publisherVersion: string;
	description?: string;
	runUrl: string;
	publishedAt?: string;
	publicListingList: AdminGamePublicListingResponseDto[];
};
export type AdminGameResponseDto = {
	id: string;
	title: string;
	slug: string;
	summary?: string;
	description?: string;
	publisher: AdminGamePublisherResponseDto;
	publishedAt?: string;
	featured?: boolean;
	versionList: AdminGameVersionResponseDto[];
};
export type GetAdminGameResponseDto = {
	game: AdminGameResponseDto;
};
export type CreateAdminGameRequestDto = {
	description?: string;
	featured?: boolean;
	publishedAt?: string;
	publisherId: string;
	slug: string;
	summary?: string;
	title: string;
};
export type UpdateAdminGameRequestDto = {
	description?: string;
	featured?: boolean;
	publishedAt?: string | null;
	slug?: string;
	summary?: string;
	title?: string;
};
export type CreateAdminGameVersionRequestDto = {
	publisherVersion: string;
	description?: string;
	runUrl: string;
	publishedAt?: string;
};
export type UpdateAdminGameVersionRequestDto = {
	publisherVersion?: string;
	description?: string;
	runUrl?: string;
	publishedAt?: string | null;
};
export type AdminGameListingPriceGroupRequestDto = {
	languageList: string[];
	price: AdminGameListingPriceRequestDto;
};
export type CreateAdminPublicGameListingRequestDto = {
	gameVersionId: string;
	priceGroupList: AdminGameListingPriceGroupRequestDto[];
	available: boolean;
	startAt?: string;
	endAt?: string;
	publishedAt?: string;
};
export type UpdateAdminPublicGameListingRequestDto = {
	priceGroupList?: AdminGameListingPriceGroupRequestDto[];
	available?: boolean;
	startAt?: string;
	endAt?: string | null;
	publishedAt?: string | null;
};
export type AdminGameListingGameResponseDto = {
	id: string;
	title: string;
	slug: string;
};
export type AdminGameListingPublisherResponseDto = {
	id: string;
	name: string;
	slug: string;
};
export type AdminGameListingVersionResponseDto = {
	id: string;
	publisherVersion: string;
};
export type AdminGameListingPriceGroupResponseDto = {
	id: string;
	price: MoneyDto;
	languageList: string[];
};
export type AdminGameListingListItemResponseDto = {
	listingType: "public" | "classroom";
	id: string;
	price?: MoneyDto;
	game: AdminGameListingGameResponseDto;
	publisher: AdminGameListingPublisherResponseDto;
	gameVersion: AdminGameListingVersionResponseDto;
	priceGroupList?: AdminGameListingPriceGroupResponseDto[];
	language?: string;
	courseType?: string;
	available?: boolean;
	publishedAt?: string;
	designatedPayor?: ClassroomGameListingDesignatedPayor;
	includedLicenseQuantity?: number;
	licenseDurationDays?: number;
	classroom?: object;
	startAt?: string;
	endAt?: string;
};
export type GetAdminGameListingListResponseDto = {
	listingList: AdminGameListingListItemResponseDto[];
	totalItemCount: number;
};
export type AdminTaxonomyTermListItemResponseDto = {
	id: string;
	type: TaxonomyType;
	label: string;
	slug: string;
};
export type GetAdminTaxonomyTermListResponseDto = {
	taxonomyTermList: AdminTaxonomyTermListItemResponseDto[];
	totalItemCount: number;
};
export type AdminTaxonomyTermResponseDto = {
	taxonomyTerm: AdminTaxonomyTermListItemResponseDto;
};
export type CreateAdminTaxonomyTermRequestDto = {
	label: string;
	slug: string;
	type: TaxonomyType;
};
export type UpdateAdminTaxonomyTermRequestDto = {
	label?: string;
	slug?: string;
	type?: TaxonomyType;
};
export type UserStatus = "pending" | "active";
export type AdminUserListItemResponseDto = {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	status: UserStatus;
	createdAt?: string;
	isAdmin: boolean;
};
export type GetAdminUserListResponseDto = {
	userList: AdminUserListItemResponseDto[];
	totalItemCount: number;
};
export type GameAcquisitionMechanism =
  "user_paid" | "institution_funded" | "complimentary";
export type AdminAcquisitionListItemResponseDto = {
	id: string;
	userEmail: string;
	userName: string;
	gameTitle: string;
	price: object;
	mechanism: GameAcquisitionMechanism;
	createdAt?: string;
	licenseStartAt?: string;
	licenseEndAt?: string;
};
export type GetAdminAcquisitionListResponseDto = {
	acquisitionList: AdminAcquisitionListItemResponseDto[];
	totalItemCount: number;
};
export type AdminAcquisitionEventResponseDto = {
	id: string;
	eventType: string;
	actorType: string;
	actorName?: string;
	reason?: string;
	providerReference?: string;
	correlationId?: string;
	metadata?: {
		[key: string]: any;
	};
	createdAt: string;
};
export type GetAdminAcquisitionDetailResponseDto = {
	id: string;
	mechanism: "user_paid" | "institution_funded" | "complimentary";
	price: object;
	userName: string;
	userEmail: string;
	gameTitle: string;
	publisherVersion?: string;
	language?: string;
	courseType?: string;
	classroomName?: string;
	institutionName?: string;
	license: object;
	paymentAttempt?: object;
	codeRedemption?: object;
	createdAt?: string;
	eventList: AdminAcquisitionEventResponseDto[];
};
export type GamePaymentAttemptStatus = "pending" | "fulfilled" | "failed";
export type AdminPaymentAttemptListItemResponseDto = {
	id: string;
	userEmail: string;
	userName: string;
	gameTitle: string;
	price: object;
	status: GamePaymentAttemptStatus;
	licenseDurationDays: number;
	createdAt?: string;
	fulfilledAt?: string;
};
export type GetAdminPaymentAttemptListResponseDto = {
	paymentAttemptList: AdminPaymentAttemptListItemResponseDto[];
	totalItemCount: number;
};
export type AdminLicenseListItemResponseDto = {
	id: string;
	userEmail: string;
	userName: string;
	gameTitle: string;
	startAt: string;
	endAt: string;
	status: "active" | "scheduled" | "expired";
	createdAt?: string;
};
export type GetAdminLicenseListResponseDto = {
	licenseList: AdminLicenseListItemResponseDto[];
	totalItemCount: number;
};
export type AdminAcquisitionCodeRedemptionResponseDto = {
	id: string;
	userName: string;
	userEmail: string;
	redeemedAt?: string;
};
export type AdminAcquisitionCodeListItemResponseDto = {
	id: string;
	code: string;
	status: "active" | "expired" | "revoked";
	expiresAt: string;
	createdAt?: string;
	revokedAt?: string;
	classroomId?: string;
	classroomName?: string;
	institutionId?: string;
	institutionName?: string;
	gameTitle?: string;
	publisherVersion?: string;
	language?: string;
	courseType?: string;
	designatedPayor?: string;
	licenseDurationDays?: number;
	price?: object;
	redemptionList: AdminAcquisitionCodeRedemptionResponseDto[];
	eventList: AdminAcquisitionEventResponseDto[];
};
export type GetAdminAcquisitionCodeListResponseDto = {
	acquisitionCodeList: AdminAcquisitionCodeListItemResponseDto[];
	totalItemCount: number;
};
export type CreateAdminAcquisitionCodesResponseDto = {
	codeList: string[];
};
export type CreateAdminAcquisitionCodesRequestDto = {
	classroomGameListingId: string;
	quantity: number;
	expiresAt: string;
};
export type RevokeAdminAcquisitionCodeRequestDto = {
	reason: string;
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
export type CreateAdminCourseRequestDto = {
	description?: string;
	institutionId: string;
	name: string;
	code: string;
	slug: string;
	summary?: string;
};
export type UpdateAdminCourseRequestDto = {
	description?: string;
	code?: string;
	institutionId?: string;
	name?: string;
	slug?: string;
	status?: EducationCatalogStatus;
	summary?: string;
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
export type GameCheckoutResponseDto = {
	checkoutUrl: string;
	checkoutSessionId: string;
};
export type GameAcquisitionRequestDto = {
	publicListingId: string;
	language: string;
};
export type PublisherResponseDto = {
	id: string;
	name: string;
	slug: string;
	websiteUrl?: string;
};
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
	publisher: PublisherResponseDto;
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
export type PublicGameListingPriceGroupResponseDto = {
	price: MoneyDto;
	languageList: string[];
};
export type PublicGameListingResponseDto = {
	id: string;
	priceGroupList: PublicGameListingPriceGroupResponseDto[];
	startAt: string;
	endAt?: string;
};
export type GameVersionResponseDto = {
	id: string;
	publicListingList: PublicGameListingResponseDto[];
	description?: string;
	publisherVersion: string;
	runUrl: string;
	publishedAt?: string;
};
export type GetGameResponseDto = {
	game: GameResponseDto;
	gameVersionList: GameVersionResponseDto[];
};
export type GetClassroomListResponseDto = {
	classroomList: ClassroomResponseDto[];
	totalItemCount: number;
};
export type RedeemAcquisitionCodeResponseDto = {
	licenseId: string;
	licenseDurationDays: number;
};
export type RedeemAcquisitionCodeRequestDto = {
	code: string;
};
export type ClassroomGameListingClassroomResponseDto = {
	id: string;
	name: string;
	slug: string;
	institution: InstitutionResponseDto;
};
export type ClassroomGameListingResponseDto = {
	id: string;
	classroom: ClassroomGameListingClassroomResponseDto;
	game: GameResponseDto;
	designatedPayor: ClassroomGameListingDesignatedPayor;
	gameVersionId: string;
	price?: MoneyDto;
	includedLicenseQuantity?: number;
	customizationId?: string;
	language: string;
	courseType: string;
	startAt: string;
	endAt: string;
	licenseDurationDays: number;
	createdAt: string;
	updatedAt: string;
};
export type GetClassroomGameListingListResponseDto = {
	classroomGameListingList: ClassroomGameListingResponseDto[];
	totalItemCount: number;
};
export type GetClassroomGameListingResponseDto = {
	classroomGameListing: ClassroomGameListingResponseDto;
};
export type UserLibraryGameResponseDto = {
	id: string;
	title: string;
	slug: string;
};
export type UserLibraryVersionResponseDto = {
	id: string;
	publisherVersion: string;
	runUrl: string;
};
export type UserLibraryClassroomResponseDto = {
	id: string;
	name: string;
	slug: string;
};
export type UserLibraryItemResponseDto = {
	id: string;
	game: UserLibraryGameResponseDto;
	gameVersion: UserLibraryVersionResponseDto;
	language: string;
	courseType: string;
	customizationId?: string;
	classroom?: UserLibraryClassroomResponseDto;
	classroomGameListingId?: string;
	startAt: string;
	endAt: string;
	createdAt: string;
	isActive: boolean;
	status: "active" | "scheduled" | "expired";
	acquisitionMechanism: string;
};
export type UserLibraryResponseDto = {
	itemList: UserLibraryItemResponseDto[];
};
export type GameLaunchResponseDto = {
	licenseId: string;
	launchUrl: string;
	launchTicket: string;
	gameVersionId: string;
	validForSeconds: number;
};
export type UpdateProfileRequestDto = {
	firstName: string;
	lastName: string;
};
export type GameCheckoutStatusResponseDto = {
	status: "pending" | "fulfilled" | "failed";
	checkoutUrl?: string;
};
export type UserPaymentAttemptResponseDto = {
	id: string;
	gameTitle: string;
	price: object;
	status: GamePaymentAttemptStatus;
	createdAt: string;
	fulfilledAt?: string;
	canRevalidate: boolean;
};
export type UserPaymentAttemptListResponseDto = {
	itemList: UserPaymentAttemptResponseDto[];
};
export type ChangePasswordRequestDto = {
	currentPassword: string;
	password: string;
};
export const {
	useAdminGetSessionQuery,
	useAdminGetInstitutionListQuery,
	useAdminCreateInstitutionMutation,
	useAdminGetInstitutionByIdQuery,
	useAdminUpdateInstitutionMutation,
	useAdminGetClassroomListQuery,
	useAdminCreateClassroomMutation,
	useAdminGetClassroomByIdQuery,
	useAdminUpdateClassroomMutation,
	useAdminCreateClassroomGameListingMutation,
	useAdminGetClassroomGameListingListQuery,
	useAdminGetClassroomGameListingByIdQuery,
	useAdminUpdateClassroomGameListingMutation,
	useAdminGetInstructorListQuery,
	useAdminCreateInstructorMutation,
	useAdminGetInstructorByIdQuery,
	useAdminUpdateInstructorMutation,
	useAdminGetPublisherListQuery,
	useAdminCreatePublisherMutation,
	useAdminUpdatePublisherMutation,
	useAdminGetPublisherByIdQuery,
	useAdminGetGameListQuery,
	useAdminCreateGameMutation,
	useAdminUpdateGameMutation,
	useAdminGetGameByIdQuery,
	useAdminCreateGameVersionMutation,
	useAdminUpdateGameVersionMutation,
	useAdminCreatePublicGameListingMutation,
	useAdminUpdatePublicGameListingMutation,
	useAdminGetGameListingListQuery,
	useAdminGetTaxonomyTermListQuery,
	useAdminCreateTaxonomyTermMutation,
	useAdminUpdateTaxonomyTermMutation,
	useAdminGetUserListQuery,
	useAdminGetAcquisitionListQuery,
	useAdminGetAcquisitionQuery,
	useAdminGetPaymentAttemptListQuery,
	useAdminGetLicenseListQuery,
	useAdminGetAcquisitionCodeListQuery,
	useAdminGetAcquisitionCodeQuery,
	useAdminCreateAcquisitionCodesMutation,
	useAdminRevokeAcquisitionCodeMutation,
	useAdminGetCourseListQuery,
	useAdminCreateCourseMutation,
	useAdminGetCourseByIdQuery,
	useAdminUpdateCourseMutation,
	useAuthGetSessionQuery,
	useAuthRegisterMutation,
	useAuthLoginMutation,
	useAuthLogoutMutation,
	useAuthResendVerificationMutation,
	useAuthConfirmEmailMutation,
	useAuthRequestPasswordResetMutation,
	useAuthResetPasswordMutation,
	useGameAcquireGameMutation,
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
	useClassroomGameListingRedeemAcquisitionCodeMutation,
	useClassroomGameListingAcquireClassroomGameListingMutation,
	useClassroomGameListingGetClassroomGameListingListQuery,
	useClassroomGameListingGetClassroomGameListingByIdQuery,
	useStripeWebhookProcessWebhookMutation,
	useHealthAliveQuery,
	useHealthCheckQuery,
	useUserGetLibraryQuery,
	useUserLaunchGameMutation,
	useUserGetOwnUserQuery,
	useUserUpdateProfileMutation,
	useUserGetCheckoutStatusQuery,
	useUserGetPaymentAttemptsQuery,
	useUserRevalidatePaymentAttemptMutation,
	useUserChangePasswordMutation,
} = injectedRtkApi;

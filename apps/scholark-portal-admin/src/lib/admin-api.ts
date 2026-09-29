const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const apiBaseUrl = (configuredApiBaseUrl || '/api/v1').replace(/\/+$/, '');
const apiBase = apiBaseUrl;
export const adminSessionExpiredEvent = 'scholark-admin-session-expired';

async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
	const response = await globalThis.fetch(input, init);
	if (response.status === 401 && typeof window !== 'undefined') {
		window.dispatchEvent(new Event(adminSessionExpiredEvent));
	}
	return response;
}

export interface Institution {
	description?: string;
	id: string;
	name: string;
	slug: string;
	status: 'active' | 'inactive';
	summary?: string;
	websiteUrl?: string;
}

export interface InstitutionListResponse {
	institutionList: Institution[];
	totalItemCount: number;
}

export interface CreateInstitutionInput {
	description?: string;
	name: string;
	slug: string;
	summary?: string;
	websiteUrl?: string;
}

export type UpdateInstitutionInput = Partial<CreateInstitutionInput> & { status?: Institution['status'] };

export interface Classroom {
	code: string;
	courseList: { code: string; id: string; name: string; slug: string }[];
	description?: string;
	id: string;
	institution: Institution;
	instructorList: { id: string; name: string; slug: string }[];
	name: string;
	slug: string;
	status: 'active' | 'inactive';
	summary?: string;
	taxonomyTermList: { id: string; label: string; slug: string; type: string }[];
}

export interface ClassroomListResponse {
	classroomList: Classroom[];
	totalItemCount: number;
}

export interface CreateClassroomInput {
	code: string;
	courseIdList: string[];
	description?: string;
	institutionId: string;
	instructorIdList: string[];
	name: string;
	slug: string;
	summary?: string;
	taxonomyTermIdList: string[];
}

export type UpdateClassroomInput = Partial<CreateClassroomInput> & { status?: Classroom['status'] };

export interface Course {
	code: string;
	description?: string;
	id: string;
	institution: Institution;
	name: string;
	slug: string;
	status: 'active' | 'inactive';
	summary?: string;
}

export interface CourseListResponse {
	courseList: Course[];
	totalItemCount: number;
}

export interface CreateCourseInput {
	code: string;
	description?: string;
	institutionId: string;
	name: string;
	slug: string;
	summary?: string;
}

export type UpdateCourseInput = Partial<CreateCourseInput> & { status?: Course['status'] };

export interface ClassroomGame {
	classroomId: string;
	classroomName: string;
	classroomSlug: string;
	designatedPayor: 'student' | 'institution';
	endAt: string;
	gameId: string;
	gamePublishedAt?: string;
	gameSlug: string;
	gameTitle: string;
	gameVersionId: string;
	id: string;
	institution: Pick<Institution, 'id' | 'name' | 'slug'>;
	institutionGameOfferId: string;
	language: string;
	licenseDurationDays: number;
	mode: string;
	price: { currency: string; minorUnitAmount: number };
	publisherVersion: string;
	publisher: { id: string; name: string; slug: string };
	publishedAt?: string;
	startAt: string;
}

export interface ClassroomGameListResponse {
	classroomGameList: ClassroomGame[];
	totalItemCount: number;
}

export interface CreateAdminClassroomGameInput {
	classroomId: string;
	endAt: string;
	institutionGameOfferId: string;
	publishedAt?: string;
	startAt: string;
}

export type UpdateAdminClassroomGameInput = Partial<Omit<CreateAdminClassroomGameInput, 'publishedAt'>> & {
	publishedAt?: string | null;
};

export interface Instructor {
	id: string;
	name: string;
	slug: string;
}

export interface InstructorProfile extends Instructor {
	classroomList: {
		code: string;
		id: string;
		institution: Pick<Institution, 'id' | 'name' | 'slug'>;
		name: string;
		slug: string;
	}[];
	institutionList: Pick<Institution, 'id' | 'name' | 'slug'>[];
}

export interface InstructorListResponse {
	instructorList: Instructor[];
	totalItemCount: number;
}

export interface CreateInstructorInput {
	classroomIdList: string[];
	institutionIdList: string[];
	name: string;
	slug: string;
}

export type UpdateInstructorInput = Partial<CreateInstructorInput>;

export interface Publisher {
	id: string;
	name: string;
	slug: string;
	websiteUrl?: string;
}

export interface PublisherProfile extends Publisher {
	gameList: {
		gameVersionList: {
			description?: string;
			id: string;
			publishedAt?: string;
			publisherVersion: string;
			runUrl: string;
		}[];
		id: string;
		publishedAt?: string;
		slug: string;
		summary?: string;
		title: string;
	}[];
}

export interface PublisherListResponse {
	publisherList: Publisher[];
	totalItemCount: number;
}

export interface CreatePublisherInput {
	name: string;
	slug: string;
	websiteUrl?: string;
}

export type UpdatePublisherInput = Partial<CreatePublisherInput>;

export interface AdminGame {
	id: string;
	featured?: boolean;
	publishedAt?: string;
	publisher: Pick<Publisher, 'id' | 'name' | 'slug'>;
	slug: string;
	title: string;
}

export interface AdminGameProfile extends AdminGame {
	description?: string;
	summary?: string;
	versionList: {
		description?: string;
		id: string;
		publishedAt?: string;
		publisherVersion: string;
		runUrl: string;
		variantList: {
			id: string;
			institutionOfferList: {
				allocatedLicenseQuantity?: number | null;
				designatedPayor: 'student' | 'institution';
				id: string;
				licenseDurationDays: number;
				price: { currency: string; minorUnitAmount: number };
				publishedAt?: string;
			}[];
			language: string;
			mode: 'default' | 'game_based_course';
			publicOfferList: {
				available: boolean;
				id: string;
				price: { currency: string; minorUnitAmount: number };
				publishedAt?: string;
			}[];
		}[];
	}[];
}

export interface AdminGameListResponse {
	gameList: AdminGame[];
	totalItemCount: number;
}

export interface CreateAdminGameInput {
	description?: string;
	featured: boolean;
	publishedAt?: string;
	publisherId: string;
	slug: string;
	summary?: string;
	title: string;
}

export type UpdateAdminGameInput = Partial<Omit<CreateAdminGameInput, 'publisherId' | 'publishedAt'>> & { publishedAt?: string | null };

export interface AdminGameOfferPrice {
	currency: string;
	minorUnitAmount: number;
}

export interface CreateAdminPublicGameOfferInput {
	available: boolean;
	gameVariantId: string;
	price: AdminGameOfferPrice;
	publishedAt?: string;
}

export interface UpdateAdminPublicGameOfferInput {
	available?: boolean;
	price?: AdminGameOfferPrice;
	publishedAt?: string | null;
}

export interface CreateAdminInstitutionGameOfferInput {
	allocatedLicenseQuantity?: number;
	designatedPayor: 'student' | 'institution';
	gameVariantId: string;
	licenseDurationDays: number;
	price: AdminGameOfferPrice;
	publishedAt?: string;
}

export interface UpdateAdminInstitutionGameOfferInput {
	allocatedLicenseQuantity?: number | null;
	designatedPayor?: 'student' | 'institution';
	licenseDurationDays?: number;
	price?: AdminGameOfferPrice;
	publishedAt?: string | null;
}

export interface CreateAdminGameVersionInput {
	description?: string;
	publishedAt?: string;
	publisherVersion: string;
	runUrl: string;
	variantList: { language: string; mode: 'default' | 'game_based_course' }[];
}

export type UpdateAdminGameVersionInput = Partial<Omit<CreateAdminGameVersionInput, 'variantList'>> & {
	variantList?: { id?: string; language: string; mode: 'default' | 'game_based_course' }[];
};

export interface AdminGameOffer {
	allocatedLicenseQuantity?: number | null;
	available?: boolean;
	designatedPayor?: 'student' | 'institution';
	game: Pick<AdminGame, 'id' | 'slug' | 'title'>;
	gameVariant: { id: string; language: string; mode: 'default' | 'game_based_course' };
	gameVersion: { id: string; publisherVersion: string };
	id: string;
	licenseDurationDays?: number;
	offerType: 'public' | 'institution';
	price: { currency: string; minorUnitAmount: number };
	publishedAt?: string;
	publisher: Pick<Publisher, 'id' | 'name' | 'slug'>;
}

export interface AdminGameOfferListResponse {
	offerList: AdminGameOffer[];
	totalItemCount: number;
}

export interface TaxonomyTerm {
	id: string;
	label: string;
	slug: string;
	type: 'category' | 'genre' | 'skill' | 'subject' | 'theme';
}

export type TaxonomyTermType = TaxonomyTerm['type'];

export interface CreateTaxonomyTermInput {
	label: string;
	slug: string;
	type: TaxonomyTermType;
}

export type UpdateTaxonomyTermInput = Partial<CreateTaxonomyTermInput>;

export interface TaxonomyTermListResponse {
	taxonomyTermList: TaxonomyTerm[];
	totalItemCount: number;
}

export interface AdminAccountUser {
	createdAt?: string;
	email: string;
	firstName?: string;
	id: string;
	isAdmin: boolean;
	lastName?: string;
	status: 'active' | 'pending';
}

export interface AdminAccountUserListResponse {
	userList: AdminAccountUser[];
	totalItemCount: number;
}

export interface AdminBillingAcquisition {
	createdAt?: string;
	gameTitle: string;
	id: string;
	licenseEndAt?: string;
	licenseStartAt?: string;
	mechanism: 'user_paid' | 'institution_funded' | 'complimentary';
	price: { currency: string; minorUnitAmount: number };
	userEmail: string;
	userName: string;
}

export interface AdminAcquisitionEvent {
	actorName?: string;
	actorType: string;
	correlationId?: string;
	createdAt: string;
	eventType: string;
	id: string;
	metadata?: Record<string, unknown>;
	providerReference?: string;
	reason?: string;
}

export interface AdminBillingAcquisitionDetail extends AdminBillingAcquisition {
	classroomName?: string;
	eventList: AdminAcquisitionEvent[];
	institutionName?: string;
	language?: string;
	license: { endAt: string; id: string; startAt: string; status: 'active' | 'expired' | 'scheduled' };
	mode?: string;
	paymentAttempt?: {
		fulfilledAt?: string;
		id: string;
		status: 'pending' | 'fulfilled' | 'failed';
		stripeCheckoutSessionId?: string;
		stripePaymentIntentId?: string;
	};
	publisherVersion?: string;
	codeRedemption?: { codeId: string; codeMask: string; expiresAt: string; id: string; redeemedAt?: string };
}

export interface AdminBillingPaymentAttempt {
	createdAt?: string;
	fulfilledAt?: string;
	gameTitle: string;
	id: string;
	licenseDurationDays: number;
	price: { currency: string; minorUnitAmount: number };
	status: 'pending' | 'fulfilled' | 'failed';
	userEmail: string;
	userName: string;
}

export interface AdminBillingLicense {
	createdAt?: string;
	endAt: string;
	gameTitle: string;
	id: string;
	startAt: string;
	status: 'active' | 'scheduled' | 'expired';
	userEmail: string;
	userName: string;
}

export interface AdminAcquisitionCodeRedemption {
	id: string;
	redeemedAt?: string;
	userEmail: string;
	userName: string;
}

export interface AdminAcquisitionCode {
	classroomId?: string;
	classroomName?: string;
	code: string;
	createdAt?: string;
	designatedPayor?: string;
	expiresAt: string;
	eventList: AdminAcquisitionEvent[];
	gameTitle?: string;
	id: string;
	institutionId?: string;
	institutionName?: string;
	language?: string;
	licenseDurationDays?: number;
	mode?: string;
	price?: { currency: string; minorUnitAmount: number };
	publisherVersion?: string;
	redemptionList: AdminAcquisitionCodeRedemption[];
	revokedAt?: string;
	status: 'active' | 'expired' | 'revoked';
}

export interface AdminAcquisitionCodeListResponse {
	acquisitionCodeList: AdminAcquisitionCode[];
	totalItemCount: number;
}

export interface CreateAdminAcquisitionCodesInput {
	classroomGameId: string;
	expiresAt: string;
	quantity: number;
}

export interface CreateAdminAcquisitionCodesResponse {
	codeList: string[];
}

export async function getInstitutionList(
	query: string,
	offset: number,
	status: string,
	signal?: AbortSignal,
): Promise<InstitutionListResponse> {
	const searchParams = new URLSearchParams({ limit: '10', offset: String(offset) });
	if (query.trim()) {
		searchParams.set('q', query.trim());
	}
	if (status) {
		searchParams.set('status', status);
	}

	const response = await adminFetch(`${apiBaseUrl}/admin/institutions?${searchParams}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Institutions could not be loaded.');
	}

	return await response.json() as InstitutionListResponse;
}

export async function getAllInstitutions(signal?: AbortSignal): Promise<Institution[]> {
	const institutionList: Institution[] = [];
	let offset = 0;
	let totalItemCount = 0;

	do {
		const result = await getInstitutionList('', offset, '', signal);
		institutionList.push(...result.institutionList);
		totalItemCount = result.totalItemCount;
		offset += result.institutionList.length;
	} while (offset < totalItemCount && offset > 0);

	return institutionList;
}

export async function getInstitution(id: string, signal?: AbortSignal): Promise<Institution> {
	const response = await adminFetch(`${apiBase}/admin/institutions/${encodeURIComponent(id)}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 404 ? 'Institution not found.' : 'Institution details could not be loaded.');
	}

	const result = await response.json() as { institution: Institution };
	return result.institution;
}

export async function createInstitution(input: CreateInstitutionInput): Promise<Institution> {
	return await saveAdminRecord<CreateInstitutionInput, Institution>(
		'/admin/institutions', 'POST', input, 'institution', 'Institution could not be saved.',
	);
}

export async function updateInstitution(id: string, input: UpdateInstitutionInput): Promise<Institution> {
	return await saveAdminRecord<UpdateInstitutionInput, Institution>(
		`/admin/institutions/${encodeURIComponent(id)}`, 'PATCH', input, 'institution', 'Institution could not be saved.',
	);
}

async function saveAdminRecord<TInput, TRecord>(
	path: string,
	method: 'POST' | 'PATCH',
	input: TInput,
	resourceKey: string,
	fallbackMessage: string,
): Promise<TRecord> {
	const response = await adminFetch(`${apiBase}${path}`, {
		body: JSON.stringify(input),
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		method,
	});
	if (!response.ok) {
		const body = await response.json().catch(() => undefined) as { message?: string | string[] } | undefined;
		const message = Array.isArray(body?.message) ? body.message.join(' ') : body?.message;
		throw new Error(message || (response.status === 403 ? 'Administrator access is required.' : fallbackMessage));
	}

	const result = await response.json() as Record<string, TRecord>;
	return result[resourceKey];
}

export async function getClassroomList(
	query: string,
	offset: number,
	status: string,
	institutionId: string,
	signal?: AbortSignal,
): Promise<ClassroomListResponse> {
	const searchParams = new URLSearchParams({ limit: '10', offset: String(offset) });
	if (query.trim()) {
		searchParams.set('q', query.trim());
	}
	if (status) {
		searchParams.set('status', status);
	}
	if (institutionId) {
		searchParams.set('institutionId', institutionId);
	}

	const response = await adminFetch(`${apiBase}/admin/classrooms?${searchParams}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Classrooms could not be loaded.');
	}

	return await response.json() as ClassroomListResponse;
}

export async function getClassroom(id: string, signal?: AbortSignal): Promise<Classroom> {
	const response = await adminFetch(`${apiBase}/admin/classrooms/${encodeURIComponent(id)}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 404 ? 'Classroom not found.' : 'Classroom details could not be loaded.');
	}

	const result = await response.json() as { classroom: Classroom };
	return result.classroom;
}

export async function createClassroom(input: CreateClassroomInput): Promise<Classroom> {
	return await saveAdminRecord<CreateClassroomInput, Classroom>(
		'/admin/classrooms', 'POST', input, 'classroom', 'Classroom could not be saved.',
	);
}

export async function updateClassroom(id: string, input: UpdateClassroomInput): Promise<Classroom> {
	return await saveAdminRecord<UpdateClassroomInput, Classroom>(
		`/admin/classrooms/${encodeURIComponent(id)}`, 'PATCH', input, 'classroom', 'Classroom could not be saved.',
	);
}

export async function getCourseList(
	query: string,
	offset: number,
	status: string,
	institutionId: string,
	signal?: AbortSignal,
): Promise<CourseListResponse> {
	const searchParams = new URLSearchParams({ limit: '10', offset: String(offset) });
	if (query.trim()) {
		searchParams.set('q', query.trim());
	}
	if (status) {
		searchParams.set('status', status);
	}
	if (institutionId) {
		searchParams.set('institutionId', institutionId);
	}

	const response = await adminFetch(`${apiBase}/admin/courses?${searchParams}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Courses could not be loaded.');
	}

	return await response.json() as CourseListResponse;
}

export async function getAllCourses(institutionId: string, signal?: AbortSignal): Promise<Course[]> {
	const courseList: Course[] = [];
	let offset = 0;
	let totalItemCount = 0;

	do {
		const result = await getCourseList('', offset, '', institutionId, signal);
		courseList.push(...result.courseList);
		totalItemCount = result.totalItemCount;
		offset += result.courseList.length;
	} while (offset < totalItemCount && offset > 0);

	return courseList;
}

export async function getCourse(id: string, signal?: AbortSignal): Promise<Course> {
	const response = await adminFetch(`${apiBase}/admin/courses/${encodeURIComponent(id)}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 404 ? 'Course not found.' : 'Course details could not be loaded.');
	}

	const result = await response.json() as { course: Course };
	return result.course;
}

export async function createCourse(input: CreateCourseInput): Promise<Course> {
	return await saveAdminRecord<CreateCourseInput, Course>(
		'/admin/courses', 'POST', input, 'course', 'Course could not be saved.',
	);
}

export async function updateCourse(id: string, input: UpdateCourseInput): Promise<Course> {
	return await saveAdminRecord<UpdateCourseInput, Course>(
		`/admin/courses/${encodeURIComponent(id)}`, 'PATCH', input, 'course', 'Course could not be saved.',
	);
}

export async function getClassroomGameList(
	query: string,
	offset: number,
	institutionId: string,
	classroomId: string,
	signal?: AbortSignal,
): Promise<ClassroomGameListResponse> {
	const searchParams = new URLSearchParams({ limit: '10', offset: String(offset) });
	if (query.trim()) {
		searchParams.set('q', query.trim());
	}
	if (institutionId) {
		searchParams.set('institutionId', institutionId);
	}
	if (classroomId) {
		searchParams.set('classroomId', classroomId);
	}

	const response = await adminFetch(`${apiBase}/admin/classroom-games?${searchParams}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Classroom games could not be loaded.');
	}

	return await response.json() as ClassroomGameListResponse;
}

export async function getAllAdminClassroomGames(signal?: AbortSignal): Promise<ClassroomGame[]> {
	const classroomGameList: ClassroomGame[] = [];
	let offset = 0;
	let totalItemCount = 0;

	do {
		const result = await getClassroomGameList('', offset, '', '', signal);
		classroomGameList.push(...result.classroomGameList);
		totalItemCount = result.totalItemCount;
		offset += result.classroomGameList.length;
	} while (offset < totalItemCount && offset > 0);

	return classroomGameList;
}

export async function getClassroomGame(id: string, signal?: AbortSignal): Promise<ClassroomGame> {
	const response = await adminFetch(`${apiBase}/admin/classroom-games/${encodeURIComponent(id)}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 404 ? 'Classroom game assignment not found.' : 'Classroom game details could not be loaded.');
	}

	const result = await response.json() as { classroomGame: ClassroomGame };
	return result.classroomGame;
}

export async function createAdminClassroomGame(input: CreateAdminClassroomGameInput): Promise<ClassroomGame> {
	return await saveAdminRecord<CreateAdminClassroomGameInput, ClassroomGame>(
		'/admin/classroom-games', 'POST', input, 'classroomGame', 'Classroom game assignment could not be saved.',
	);
}

export async function updateAdminClassroomGame(id: string, input: UpdateAdminClassroomGameInput): Promise<ClassroomGame> {
	return await saveAdminRecord<UpdateAdminClassroomGameInput, ClassroomGame>(
		`/admin/classroom-games/${encodeURIComponent(id)}`, 'PATCH', input, 'classroomGame', 'Classroom game assignment could not be saved.',
	);
}

export async function getInstructorList(
	query: string,
	offset: number,
	institutionId: string,
	signal?: AbortSignal,
): Promise<InstructorListResponse> {
	const searchParams = new URLSearchParams({ limit: '10', offset: String(offset) });
	if (query.trim()) {
		searchParams.set('q', query.trim());
	}
	if (institutionId) {
		searchParams.set('institutionId', institutionId);
	}

	const response = await adminFetch(`${apiBase}/admin/instructors?${searchParams}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Instructors could not be loaded.');
	}

	return await response.json() as InstructorListResponse;
}

export async function getAllInstructors(signal?: AbortSignal): Promise<Instructor[]> {
	const instructorList: Instructor[] = [];
	let offset = 0;
	let totalItemCount = 0;

	do {
		const result = await getInstructorList('', offset, '', signal);
		instructorList.push(...result.instructorList);
		totalItemCount = result.totalItemCount;
		offset += result.instructorList.length;
	} while (offset < totalItemCount && offset > 0);

	return instructorList;
}

export async function getAllClassrooms(signal?: AbortSignal): Promise<Classroom[]> {
	const classroomList: Classroom[] = [];
	let offset = 0;
	let totalItemCount = 0;

	do {
		const result = await getClassroomList('', offset, '', '', signal);
		classroomList.push(...result.classroomList);
		totalItemCount = result.totalItemCount;
		offset += result.classroomList.length;
	} while (offset < totalItemCount && offset > 0);

	return classroomList;
}

export async function getInstructor(id: string, signal?: AbortSignal): Promise<InstructorProfile> {
	const response = await adminFetch(`${apiBase}/admin/instructors/${encodeURIComponent(id)}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 404 ? 'Instructor not found.' : 'Instructor details could not be loaded.');
	}

	const result = await response.json() as { instructor: InstructorProfile };
	return result.instructor;
}

export async function createInstructor(input: CreateInstructorInput): Promise<InstructorProfile> {
	return await saveAdminRecord<CreateInstructorInput, InstructorProfile>(
		'/admin/instructors', 'POST', input, 'instructor', 'Instructor could not be saved.',
	);
}

export async function updateInstructor(id: string, input: UpdateInstructorInput): Promise<InstructorProfile> {
	return await saveAdminRecord<UpdateInstructorInput, InstructorProfile>(
		`/admin/instructors/${encodeURIComponent(id)}`, 'PATCH', input, 'instructor', 'Instructor could not be saved.',
	);
}

export async function getPublisherList(query: string, offset: number, signal?: AbortSignal): Promise<PublisherListResponse> {
	const searchParams = new URLSearchParams({ limit: '10', offset: String(offset) });
	if (query.trim()) {
		searchParams.set('q', query.trim());
	}

	const response = await adminFetch(`${apiBase}/admin/publishers?${searchParams}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Publishers could not be loaded.');
	}

	return await response.json() as PublisherListResponse;
}

export async function getAllPublishers(signal?: AbortSignal): Promise<Publisher[]> {
	const publisherList: Publisher[] = [];
	let offset = 0;
	let totalItemCount = 0;

	do {
		const result = await getPublisherList('', offset, signal);
		publisherList.push(...result.publisherList);
		totalItemCount = result.totalItemCount;
		offset += result.publisherList.length;
	} while (offset < totalItemCount && offset > 0);

	return publisherList;
}

export async function getPublisher(id: string, signal?: AbortSignal): Promise<PublisherProfile> {
	const response = await adminFetch(`${apiBase}/admin/publishers/${encodeURIComponent(id)}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 404 ? 'Publisher not found.' : 'Publisher details could not be loaded.');
	}

	const result = await response.json() as { publisher: PublisherProfile };
	return result.publisher;
}

export async function createPublisher(input: CreatePublisherInput): Promise<PublisherProfile> {
	return await saveAdminRecord<CreatePublisherInput, PublisherProfile>(
		'/admin/publishers', 'POST', input, 'publisher', 'Publisher could not be saved.',
	);
}

export async function updatePublisher(id: string, input: UpdatePublisherInput): Promise<PublisherProfile> {
	return await saveAdminRecord<UpdatePublisherInput, PublisherProfile>(
		`/admin/publishers/${encodeURIComponent(id)}`, 'PATCH', input, 'publisher', 'Publisher could not be saved.',
	);
}

export async function getAdminGameList(
	query: string,
	offset: number,
	publication: string,
	publisherId: string,
	signal?: AbortSignal,
): Promise<AdminGameListResponse> {
	const searchParams = new URLSearchParams({ limit: '10', offset: String(offset) });
	if (query.trim()) {
		searchParams.set('q', query.trim());
	}
	if (publication) {
		searchParams.set('publication', publication);
	}
	if (publisherId) {
		searchParams.set('publisherId', publisherId);
	}

	const response = await adminFetch(`${apiBase}/admin/games?${searchParams}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Games could not be loaded.');
	}

	return await response.json() as AdminGameListResponse;
}

export async function getAdminGame(id: string, signal?: AbortSignal): Promise<AdminGameProfile> {
	const response = await adminFetch(`${apiBase}/admin/games/${encodeURIComponent(id)}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 404 ? 'Game not found.' : 'Game details could not be loaded.');
	}

	const result = await response.json() as { game: AdminGameProfile };
	return result.game;
}

export async function createAdminGame(input: CreateAdminGameInput): Promise<AdminGameProfile> {
	return await saveAdminRecord<CreateAdminGameInput, AdminGameProfile>(
		'/admin/games', 'POST', input, 'game', 'Game could not be saved.',
	);
}

export async function updateAdminGame(id: string, input: UpdateAdminGameInput): Promise<AdminGameProfile> {
	return await saveAdminRecord<UpdateAdminGameInput, AdminGameProfile>(
		`/admin/games/${encodeURIComponent(id)}`, 'PATCH', input, 'game', 'Game could not be saved.',
	);
}

export async function createAdminGameVersion(gameId: string, input: CreateAdminGameVersionInput): Promise<AdminGameProfile> {
	return await saveAdminRecord<CreateAdminGameVersionInput, AdminGameProfile>(
		`/admin/games/${encodeURIComponent(gameId)}/versions`, 'POST', input, 'game', 'Game version could not be saved.',
	);
}

export async function updateAdminGameVersion(
	gameId: string,
	versionId: string,
	input: UpdateAdminGameVersionInput,
): Promise<AdminGameProfile> {
	return await saveAdminRecord<UpdateAdminGameVersionInput, AdminGameProfile>(
		`/admin/games/${encodeURIComponent(gameId)}/versions/${encodeURIComponent(versionId)}`,
		'PATCH', input, 'game', 'Game version could not be saved.',
	);
}

export async function createAdminPublicGameOffer(gameId: string, input: CreateAdminPublicGameOfferInput): Promise<AdminGameProfile> {
	return await saveAdminRecord<CreateAdminPublicGameOfferInput, AdminGameProfile>(
		`/admin/games/${encodeURIComponent(gameId)}/public-offers`, 'POST', input, 'game', 'Public offer could not be saved.',
	);
}

export async function updateAdminPublicGameOffer(
	gameId: string,
	offerId: string,
	input: UpdateAdminPublicGameOfferInput,
): Promise<AdminGameProfile> {
	return await saveAdminRecord<UpdateAdminPublicGameOfferInput, AdminGameProfile>(
		`/admin/games/${encodeURIComponent(gameId)}/public-offers/${encodeURIComponent(offerId)}`,
		'PATCH', input, 'game', 'Public offer could not be saved.',
	);
}

export async function createAdminInstitutionGameOffer(
	gameId: string,
	input: CreateAdminInstitutionGameOfferInput,
): Promise<AdminGameProfile> {
	return await saveAdminRecord<CreateAdminInstitutionGameOfferInput, AdminGameProfile>(
		`/admin/games/${encodeURIComponent(gameId)}/institution-offers`, 'POST', input, 'game', 'Institution offer could not be saved.',
	);
}

export async function updateAdminInstitutionGameOffer(
	gameId: string,
	offerId: string,
	input: UpdateAdminInstitutionGameOfferInput,
): Promise<AdminGameProfile> {
	return await saveAdminRecord<UpdateAdminInstitutionGameOfferInput, AdminGameProfile>(
		`/admin/games/${encodeURIComponent(gameId)}/institution-offers/${encodeURIComponent(offerId)}`,
		'PATCH', input, 'game', 'Institution offer could not be saved.',
	);
}

export async function getAdminGameOfferList(
	type: 'public' | 'institution',
	query: string,
	offset: number,
	signal?: AbortSignal,
): Promise<AdminGameOfferListResponse> {
	const searchParams = new URLSearchParams({ limit: '10', offset: String(offset), type });
	if (query.trim()) {
		searchParams.set('q', query.trim());
	}

	const response = await adminFetch(`${apiBase}/admin/game-offers?${searchParams}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Game offers could not be loaded.');
	}

	return await response.json() as AdminGameOfferListResponse;
}

export async function getAllAdminInstitutionGameOffers(signal?: AbortSignal): Promise<AdminGameOffer[]> {
	const offerList: AdminGameOffer[] = [];
	let offset = 0;
	let totalItemCount = 0;

	do {
		const result = await getAdminGameOfferList('institution', '', offset, signal);
		offerList.push(...result.offerList);
		totalItemCount = result.totalItemCount;
		offset += result.offerList.length;
	} while (offset < totalItemCount && offset > 0);

	return offerList;
}

export async function getTaxonomyTermList(
	query: string,
	offset: number,
	type: string,
	signal?: AbortSignal,
): Promise<TaxonomyTermListResponse> {
	const searchParams = new URLSearchParams({ limit: '10', offset: String(offset) });
	if (query.trim()) {
		searchParams.set('q', query.trim());
	}
	if (type) {
		searchParams.set('type', type);
	}

	const response = await adminFetch(`${apiBase}/admin/taxonomy?${searchParams}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Taxonomy terms could not be loaded.');
	}

	return await response.json() as TaxonomyTermListResponse;
}

export async function getAllTaxonomyTerms(signal?: AbortSignal): Promise<TaxonomyTerm[]> {
	const taxonomyTermList: TaxonomyTerm[] = [];
	let offset = 0;
	let totalItemCount = 0;

	do {
		const result = await getTaxonomyTermList('', offset, '', signal);
		taxonomyTermList.push(...result.taxonomyTermList);
		totalItemCount = result.totalItemCount;
		offset += result.taxonomyTermList.length;
	} while (offset < totalItemCount && offset > 0);

	return taxonomyTermList;
}

export async function createTaxonomyTerm(input: CreateTaxonomyTermInput): Promise<TaxonomyTerm> {
	return await saveAdminRecord<CreateTaxonomyTermInput, TaxonomyTerm>(
		'/admin/taxonomy', 'POST', input, 'taxonomyTerm', 'Taxonomy term could not be saved.',
	);
}

export async function updateTaxonomyTerm(id: string, input: UpdateTaxonomyTermInput): Promise<TaxonomyTerm> {
	return await saveAdminRecord<UpdateTaxonomyTermInput, TaxonomyTerm>(
		`/admin/taxonomy/${encodeURIComponent(id)}`, 'PATCH', input, 'taxonomyTerm', 'Taxonomy term could not be saved.',
	);
}

export async function getAdminAccountUserList(
	query: string,
	offset: number,
	status: string,
	signal?: AbortSignal,
): Promise<AdminAccountUserListResponse> {
	const searchParams = new URLSearchParams({ limit: '10', offset: String(offset) });
	if (query.trim()) {
		searchParams.set('q', query.trim());
	}
	if (status) {
		searchParams.set('status', status);
	}

	const response = await adminFetch(`${apiBase}/admin/users?${searchParams}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Users could not be loaded.');
	}

	return await response.json() as AdminAccountUserListResponse;
}

async function getAdminBillingList<T>(
	resource: 'acquisitions' | 'payment-attempts' | 'licenses',
	query: string,
	offset: number,
	filterName: 'mechanism' | 'status',
	filter: string,
	signal?: AbortSignal,
): Promise<T> {
	const searchParams = new URLSearchParams({ limit: '10', offset: String(offset) });
	if (query.trim()) {
		searchParams.set('q', query.trim());
	}
	if (filter) {
		searchParams.set(filterName, filter);
	}

	const response = await adminFetch(`${apiBase}/admin/billing/${resource}?${searchParams}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Billing records could not be loaded.');
	}

	return await response.json() as T;
}

export function getAdminAcquisitionList(
	query: string,
	offset: number,
	mechanism: string,
	signal?: AbortSignal,
): Promise<{ acquisitionList: AdminBillingAcquisition[]; totalItemCount: number }> {
	return getAdminBillingList<{ acquisitionList: AdminBillingAcquisition[]; totalItemCount: number }>(
		'acquisitions', query, offset, 'mechanism', mechanism, signal,
	);
}

export function getAdminPaymentAttemptList(
	query: string,
	offset: number,
	status: string,
	signal?: AbortSignal,
): Promise<{ paymentAttemptList: AdminBillingPaymentAttempt[]; totalItemCount: number }> {
	return getAdminBillingList<{ paymentAttemptList: AdminBillingPaymentAttempt[]; totalItemCount: number }>(
		'payment-attempts', query, offset, 'status', status, signal,
	);
}

export function getAdminLicenseList(
	query: string,
	offset: number,
	status: string,
	signal?: AbortSignal,
): Promise<{ licenseList: AdminBillingLicense[]; totalItemCount: number }> {
	return getAdminBillingList<{ licenseList: AdminBillingLicense[]; totalItemCount: number }>(
		'licenses', query, offset, 'status', status, signal,
	);
}

export async function getAdminAcquisitionCodeList(
	query: string,
	offset: number,
	institutionId: string,
	signal?: AbortSignal,
): Promise<AdminAcquisitionCodeListResponse> {
	const searchParams = new URLSearchParams({ limit: '10', offset: String(offset) });
	if (query.trim()) {
		searchParams.set('q', query.trim());
	}
	if (institutionId) {
		searchParams.set('institutionId', institutionId);
	}

	const response = await adminFetch(`${apiBase}/admin/billing/acquisition-codes?${searchParams}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Acquisition codes could not be loaded.');
	}

	return await response.json() as AdminAcquisitionCodeListResponse;
}

export async function getAdminAcquisition(id: string, signal?: AbortSignal): Promise<AdminBillingAcquisitionDetail> {
	const response = await adminFetch(`${apiBase}/admin/billing/acquisitions/${encodeURIComponent(id)}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Acquisition details could not be loaded.');
	}

	return await response.json() as AdminBillingAcquisitionDetail;
}

export async function getAdminAcquisitionCode(id: string, signal?: AbortSignal): Promise<AdminAcquisitionCode> {
	const response = await adminFetch(`${apiBase}/admin/acquisition-codes/${encodeURIComponent(id)}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Acquisition code could not be loaded.');
	}

	return await response.json() as AdminAcquisitionCode;
}

export async function createAdminAcquisitionCodes(
	input: CreateAdminAcquisitionCodesInput,
): Promise<CreateAdminAcquisitionCodesResponse> {
	const response = await adminFetch(`${apiBase}/admin/acquisition-codes`, {
		body: JSON.stringify(input),
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Acquisition codes could not be created.');
	}

	return await response.json() as CreateAdminAcquisitionCodesResponse;
}

export async function revokeAdminAcquisitionCode(id: string, reason: string): Promise<void> {
	const response = await adminFetch(`${apiBase}/admin/acquisition-codes/${encodeURIComponent(id)}/revoke`, {
		body: JSON.stringify({ reason }),
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		method: 'PATCH',
	});
	if (!response.ok) {
		const body = await response.json().catch(() => undefined) as { message?: string | string[] } | undefined;
		const message = Array.isArray(body?.message) ? body.message.join(' ') : body?.message;
		throw new Error(message || (response.status === 403 ? 'Administrator access is required.' : 'Acquisition code could not be revoked.'));
	}
}
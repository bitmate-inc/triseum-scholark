import "server-only";

import { apiFetch, ApiRequestError } from "../../../api/server/request/api-fetch";
import type {
	Classroom,
	ClassroomGameListResponse,
	ClassroomGameResponse,
	ClassroomListResponse,
	Course,
	CourseListResponse,
	EducationListQuery,
	Institution,
	InstitutionListResponse,
} from "../../shared/model/education";

function createQueryString(query: EducationListQuery): string {
	const searchParams = new URLSearchParams();

	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined) searchParams.set(key, String(value));
	}

	const queryString = searchParams.toString();
	return queryString ? `?${queryString}` : "";
}

async function getBySlug<T>(resource: string, slug: string, responseKey: string): Promise<T | undefined> {
	try {
		const response = await apiFetch<Record<string, T>>(
			`/api/v1/catalog/${resource}/by-slug/${encodeURIComponent(slug)}`,
		);
		return response[responseKey];
	} catch (error) {
		if (error instanceof ApiRequestError && error.status === 404) return undefined;
		throw error;
	}
}

export function getInstitutionListRequest(query: EducationListQuery = {}) {
	return apiFetch<InstitutionListResponse>(`/api/v1/catalog/institution${createQueryString(query)}`);
}

export function getInstitutionRequest(slug: string) {
	return getBySlug<Institution>("institution", slug, "institution");
}

export function getCourseListRequest(query: EducationListQuery = {}) {
	return apiFetch<CourseListResponse>(`/api/v1/catalog/course${createQueryString(query)}`);
}

export function getCourseRequest(slug: string) {
	return getBySlug<Course>("course", slug, "course");
}

export function getClassroomListRequest(query: EducationListQuery = {}) {
	return apiFetch<ClassroomListResponse>(`/api/v1/catalog/classroom${createQueryString(query)}`);
}

export function getClassroomRequest(slug: string) {
	return getBySlug<Classroom>("classroom", slug, "classroom");
}

export function getClassroomGameListRequest(query: EducationListQuery = {}) {
	return apiFetch<ClassroomGameListResponse>(`/api/v1/catalog/classroom-game${createQueryString(query)}`);
}

export async function getClassroomGameRequest(id: string) {
	try {
		const response = await apiFetch<ClassroomGameResponse>(`/api/v1/catalog/classroom-game/${encodeURIComponent(id)}`);
		return response.classroomGame;
	} catch (error) {
		if (error instanceof ApiRequestError && error.status === 404) return undefined;
		throw error;
	}
}
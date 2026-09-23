const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export interface Institution {
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

	const response = await fetch(`${apiBase}/admin/institutions?${searchParams}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Institutions could not be loaded.');
	}

	return await response.json() as InstitutionListResponse;
}

export async function getInstitution(id: string, signal?: AbortSignal): Promise<Institution> {
	const response = await fetch(`${apiBase}/admin/institutions/${encodeURIComponent(id)}`, {
		credentials: 'include',
		signal,
	});
	if (!response.ok) {
		throw new Error(response.status === 404 ? 'Institution not found.' : 'Institution details could not be loaded.');
	}

	const result = await response.json() as { institution: Institution };
	return result.institution;
}
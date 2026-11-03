import { api } from "../../../api/client/api/api-base";

export type UserLibraryItem = {
	id: string;
	game: {
		id: string;
		slug: string;
		title: string;
	};
	gameVersion: {
		id: string;
		publisherVersion: string;
		runUrl: string;
		progressStructure?: {
			schemaVersion: number;
			sectionList: Array<{
				sectionIndex: string;
				label: string;
				metricList: Array<{ key: string; label: string; pointsPossible?: number }>;
			}>;
		};
	};
	language: string;
	courseType: string;
	customizationId?: string;
	classroom?: {
		id: string;
		name: string;
		slug: string;
	};
	classroomGameListingId?: string;
	progress?: {
		schemaVersion: number;
		updatedAt: string;
		summary?: {
			playTimeSeconds?: number | null;
			sessionCount?: number | null;
			completionPercent?: number | null;
			completed?: boolean | null;
			metrics?: Record<string, number | null> | null;
		} | null;
		sectionList?: Array<{
			sectionIndex: string;
			completionPercent?: number | null;
			completed?: boolean | null;
			metrics?: Record<string, number | null> | null;
		}>;
	};
	gradeResult?: {
		ruleRevision: number;
		createdAt: string;
		content: {
			scoreGiven: number | null;
			scoreMaximum: number;
			percentage: number | null;
			activityProgress: "unknown" | "in_progress" | "completed";
			gradingProgress: "not_ready" | "pending" | "fully_graded" | "incompatible";
			sectionResultList: Array<{
				sectionIndex: string;
				label: string;
				points: number;
				pointsPossible: number;
				percentage: number;
			}>;
		};
	};
	startAt: string;
	endAt: string;
	createdAt: string;
	isActive: boolean;
	status: "active" | "scheduled" | "expired";
	acquisitionMechanism: string;
};

export type UserLibraryResponse = { itemList: UserLibraryItem[] };

const libraryApi = api.injectEndpoints({
	endpoints: (build) => ({
		getUserLibrary: build.query<UserLibraryResponse, void>({
			providesTags: ["Library"],
			query: () => "/api/v1/user/me/library",
		}),
		launchGame: build.mutation<{ licenseId: string; launchUrl: string; launchTicket: string; gameVersionId: string; validForSeconds: number }, string>({
			query: (licenseId) => ({
				url: `/api/v1/user/me/library/${licenseId}/launch`,
				method: "POST",
			}),
		}),
	}),
});

export const { useGetUserLibraryQuery, useLaunchGameMutation } = libraryApi;

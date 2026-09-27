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
	};
	gameVariant: {
		id: string;
	};
	customizationId?: string;
	classroom?: {
		id: string;
		name: string;
		slug: string;
	};
	classroomGameId?: string;
	progress?: {
		completedCount: number;
		totalCount: number;
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

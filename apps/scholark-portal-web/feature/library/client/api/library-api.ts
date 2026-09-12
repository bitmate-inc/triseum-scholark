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
	customizationId?: string;
	classroom?: {
		id: string;
		name: string;
		slug: string;
	};
	startAt: string;
	endAt: string;
	isActive: boolean;
};

export type UserLibraryResponse = { itemList: UserLibraryItem[] };

const libraryApi = api.injectEndpoints({
	endpoints: (build) => ({
		getUserLibrary: build.query<UserLibraryResponse, void>({
			providesTags: ["Library"],
			query: () => "/api/v1/user/me/library",
		}),
	}),
});

export const { useGetUserLibraryQuery } = libraryApi;

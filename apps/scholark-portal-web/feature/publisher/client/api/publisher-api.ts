import { api } from "../../../api/client/api/api-base";

export type PublisherRevenueReportItem = {
	currency: string;
	gameId: string;
	gameTitle: string;
	institutionFundedLicenseCount: number;
	paidAcquisitionCount: number;
	paidSalesMinorUnitAmount: number;
	publisherId: string;
	publisherName: string;
};

export type PublisherRevenueReportResponse = {
	reportList: PublisherRevenueReportItem[];
};

const publisherApi = api.injectEndpoints({
	endpoints: (build) => ({
		getPublisherRevenueReport: build.query<PublisherRevenueReportResponse, void>({
			query: () => "/api/v1/publisher/me/revenue",
		}),
	}),
});

export const { useGetPublisherRevenueReportQuery } = publisherApi;
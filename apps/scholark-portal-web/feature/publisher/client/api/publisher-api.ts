import { api } from "../../../api/client/api/api-base";

export type PublisherRevenueInterval = "day" | "week" | "month" | "year";

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

export type PublisherRevenueTimeSeriesItem = {
	bucketStartAt: string;
	currency: string;
	paidAcquisitionCount: number;
	paidSalesMinorUnitAmount: number;
};

export type PublisherRevenueReportResponse = {
	from: string;
	interval: PublisherRevenueInterval;
	reportList: PublisherRevenueReportItem[];
	timeSeriesList: PublisherRevenueTimeSeriesItem[];
	to: string;
};

const publisherApi = api.injectEndpoints({
	endpoints: (build) => ({
		getPublisherRevenueReport: build.query<
			PublisherRevenueReportResponse,
			{ from: string; interval: PublisherRevenueInterval; to: string }
		>({
			query: ({ from, interval, to }) => ({
				url: "/api/v1/publisher/me/revenue",
				params: { from, interval, to },
			}),
		}),
	}),
});

export const { useGetPublisherRevenueReportQuery } = publisherApi;
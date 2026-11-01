import { ApiProperty } from '@nestjs/swagger';

import type { GetPublisherRevenueReportQueryResult, PublisherRevenueReportItem } from '../../core/feature/publisher/query/get.publisher.revenue.report.query';

export class PublisherRevenueReportItemResponseDto implements PublisherRevenueReportItem {

	@ApiProperty()
	currency!: string;

	@ApiProperty({ format: 'uuid' })
	gameId!: string;

	@ApiProperty()
	gameTitle!: string;

	@ApiProperty({ minimum: 0 })
	institutionFundedLicenseCount!: number;

	@ApiProperty({ minimum: 0 })
	paidAcquisitionCount!: number;

	@ApiProperty({ description: 'Gross paid acquisition amount in minor currency units.', minimum: 0 })
	paidSalesMinorUnitAmount!: number;

	@ApiProperty({ format: 'uuid' })
	publisherId!: string;

	@ApiProperty()
	publisherName!: string;

}

export class PublisherRevenueReportResponseDto implements GetPublisherRevenueReportQueryResult {

	@ApiProperty({ type: [PublisherRevenueReportItemResponseDto] })
	reportList!: PublisherRevenueReportItemResponseDto[];

	static fromQueryResult(result: GetPublisherRevenueReportQueryResult): PublisherRevenueReportResponseDto {
		return { reportList: result.reportList };
	}

}
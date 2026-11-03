import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsDateString,
	IsEnum,
	IsOptional
} from 'class-validator';

import {
	GetPublisherRevenueReportQueryData,
	GetPublisherRevenueReportQueryResult,
	PublisherRevenueInterval,
	PublisherRevenueReportItem,
	PublisherRevenueTimeSeriesItem,
} from '../../core/feature/publisher/query/get.publisher.revenue.report.query';

export class GetPublisherRevenueReportQueryDto implements GetPublisherRevenueReportQueryData {

	@ApiPropertyOptional({ format: 'date', example: '2026-10-01' })
	@IsOptional()
	@IsDateString({ strict: true })
	from?: string;

	@ApiPropertyOptional({ enum: PublisherRevenueInterval })
	@IsOptional()
	@IsEnum(PublisherRevenueInterval)
	interval?: PublisherRevenueInterval;

	@ApiPropertyOptional({ format: 'date', example: '2026-10-31' })
	@IsOptional()
	@IsDateString({ strict: true })
	to?: string;

}

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

export class PublisherRevenueTimeSeriesResponseDto implements PublisherRevenueTimeSeriesItem {

	@ApiProperty({ format: 'date' })
	bucketStartAt!: string;

	@ApiProperty()
	currency!: string;

	@ApiProperty({ minimum: 0 })
	paidAcquisitionCount!: number;

	@ApiProperty({ description: 'Gross paid acquisition amount in minor currency units.', minimum: 0 })
	paidSalesMinorUnitAmount!: number;

}

export class PublisherRevenueReportResponseDto implements GetPublisherRevenueReportQueryResult {

	@ApiProperty({ format: 'date' })
	from!: string;

	@ApiProperty({ enum: PublisherRevenueInterval })
	interval!: PublisherRevenueInterval;

	@ApiProperty({ type: [PublisherRevenueReportItemResponseDto] })
	reportList!: PublisherRevenueReportItemResponseDto[];

	@ApiProperty({ type: [PublisherRevenueTimeSeriesResponseDto] })
	timeSeriesList!: PublisherRevenueTimeSeriesResponseDto[];

	@ApiProperty({ format: 'date' })
	to!: string;

	static fromQueryResult(result: GetPublisherRevenueReportQueryResult): PublisherRevenueReportResponseDto {
		return result;
	}

}
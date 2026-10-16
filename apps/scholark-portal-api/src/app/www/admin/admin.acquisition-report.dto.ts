import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

import type {
	GetAdminAcquisitionReportQueryData,
	GetAdminAcquisitionReportQueryResult,
	InstitutionLicenseReportItem,
	PublisherAcquisitionReportItem,
} from '../../core/feature/admin/query/get.admin.acquisition.report.query';

export class GetAdminAcquisitionReportQueryDto implements GetAdminAcquisitionReportQueryData {

	@ApiPropertyOptional({ format: 'date', example: '2026-10-01' })
	@IsOptional()
	@IsDateString({ strict: true })
	from?: string;

	@ApiPropertyOptional({ format: 'date', example: '2026-10-31' })
	@IsOptional()
	@IsDateString({ strict: true })
	to?: string;

}

export class PublisherAcquisitionReportItemResponseDto implements PublisherAcquisitionReportItem {

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

	@ApiProperty({ description: 'Captured paid amount in minor currency units.', minimum: 0 })
	paidSalesMinorUnitAmount!: number;

	@ApiProperty({ format: 'uuid' })
	publisherId!: string;

	@ApiProperty()
	publisherName!: string;

}

export class InstitutionLicenseReportItemResponseDto implements InstitutionLicenseReportItem {

	@ApiProperty({ minimum: 0 })
	activeLicenseCount!: number;

	@ApiProperty({ format: 'uuid' })
	classroomId!: string;

	@ApiProperty()
	classroomName!: string;

	@ApiProperty({ minimum: 0 })
	codeIssuedCount!: number;

	@ApiProperty({ minimum: 0 })
	codeRedemptionCount!: number;

	@ApiProperty({ minimum: 0 })
	expiredLicenseCount!: number;

	@ApiProperty()
	gameTitle!: string;

	@ApiPropertyOptional({ description: 'Informational listing quantity; it is not enforced as a license cap.', minimum: 0 })
	includedLicenseQuantity?: number;

	@ApiProperty({ minimum: 0 })
	institutionFundedLicenseCount!: number;

	@ApiProperty({ format: 'uuid' })
	institutionId!: string;

	@ApiProperty()
	institutionName!: string;

	@ApiProperty({ format: 'uuid' })
	listingId!: string;

	@ApiProperty()
	publisherName!: string;

	@ApiProperty()
	publisherVersion!: string;

	@ApiProperty({ minimum: 0 })
	scheduledLicenseCount!: number;

	@ApiProperty({ minimum: 0 })
	uniqueCodeRedeemerCount!: number;

	@ApiProperty({ minimum: 0 })
	uniqueLicenseeCount!: number;

}

export class GetAdminAcquisitionReportResponseDto implements GetAdminAcquisitionReportQueryResult {

	@ApiProperty({ type: [InstitutionLicenseReportItemResponseDto] })
	institutionReportList!: InstitutionLicenseReportItemResponseDto[];

	@ApiProperty({ type: [PublisherAcquisitionReportItemResponseDto] })
	publisherReportList!: PublisherAcquisitionReportItemResponseDto[];

	static fromQueryResult(result: GetAdminAcquisitionReportQueryResult): GetAdminAcquisitionReportResponseDto {
		return {
			institutionReportList: result.institutionReportList,
			publisherReportList: result.publisherReportList,
		};
	}

}
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable } from '@nestjs/common';

import { GameAcquisition } from '../../game/model/game.acquisition.entity';

export interface GetAdminAcquisitionReportQueryData {
	from?: string;
	to?: string;
}

export interface PublisherAcquisitionReportItem {
	currency: string;
	gameId: string;
	gameTitle: string;
	institutionFundedLicenseCount: number;
	paidAcquisitionCount: number;
	paidSalesMinorUnitAmount: number;
	publisherId: string;
	publisherName: string;
}

export interface InstitutionLicenseReportItem {
	activeLicenseCount: number;
	classroomId: string;
	classroomName: string;
	codeIssuedCount: number;
	codeRedemptionCount: number;
	expiredLicenseCount: number;
	gameTitle: string;
	includedLicenseQuantity?: number;
	institutionFundedLicenseCount: number;
	institutionId: string;
	institutionName: string;
	listingId: string;
	publisherName: string;
	publisherVersion: string;
	scheduledLicenseCount: number;
	uniqueCodeRedeemerCount: number;
	uniqueLicenseeCount: number;
}

export interface GetAdminAcquisitionReportQueryResult {
	institutionReportList: InstitutionLicenseReportItem[];
	publisherReportList: PublisherAcquisitionReportItem[];
}

interface DateRangeFilter {
	clause: string;
	parameterList: string[];
}

type RawNumber = number | string | null | undefined;

interface PublisherReportRawRow extends Omit<PublisherAcquisitionReportItem,
	'institutionFundedLicenseCount' | 'paidAcquisitionCount' | 'paidSalesMinorUnitAmount'> {
	institutionFundedLicenseCount: RawNumber;
	paidAcquisitionCount: RawNumber;
	paidSalesMinorUnitAmount: RawNumber;
}

interface InstitutionReportRawRow extends Omit<InstitutionLicenseReportItem,
	'activeLicenseCount' | 'codeIssuedCount' | 'codeRedemptionCount' | 'expiredLicenseCount' | 'includedLicenseQuantity'
	| 'institutionFundedLicenseCount' | 'scheduledLicenseCount' | 'uniqueCodeRedeemerCount' | 'uniqueLicenseeCount'> {
	activeLicenseCount: RawNumber;
	codeIssuedCount: RawNumber;
	codeRedemptionCount: RawNumber;
	expiredLicenseCount: RawNumber;
	includedLicenseQuantity: RawNumber;
	institutionFundedLicenseCount: RawNumber;
	scheduledLicenseCount: RawNumber;
	uniqueCodeRedeemerCount: RawNumber;
	uniqueLicenseeCount: RawNumber;
}

function createDateRangeFilter(column: string, data: GetAdminAcquisitionReportQueryData): DateRangeFilter {
	const conditionList: string[] = [];
	const parameterList: string[] = [];

	if (data.from) {
		conditionList.push(`${column} >= ?::date`);
		parameterList.push(data.from);
	}
	if (data.to) {
		conditionList.push(`${column} < (?::date + interval '1 day')`);
		parameterList.push(data.to);
	}

	return {
		clause: conditionList.length > 0 ? ` AND ${conditionList.join(' AND ')}` : '',
		parameterList,
	};
}

function numberValue(value: RawNumber): number {
	return Number(value ?? 0);
}

@Injectable()
export class GetAdminAcquisitionReportQuery {

	constructor(
		@InjectRepository(GameAcquisition)
		private readonly acquisitionRepository: EntityRepository<GameAcquisition>,
	) {}

	async execute(data: GetAdminAcquisitionReportQueryData = {}): Promise<GetAdminAcquisitionReportQueryResult> {
		if (data.from && data.to && new Date(data.from) > new Date(data.to)) {
			throw new BadRequestException('The start date must be on or before the end date.');
		}

		const publisherDateFilter = createDateRangeFilter('acquisition.created_at', data);
		const licenseDateFilter = createDateRangeFilter('acquisition.created_at', data);
		const codeCreatedDateFilter = createDateRangeFilter('acquisition_code.created_at', data);
		const redemptionDateFilter = createDateRangeFilter('redemption.redeemed_at', data);
		const connection = this.acquisitionRepository.getEntityManager().getConnection();

		const publisherReportRawList = await connection.execute<PublisherReportRawRow[]>(`
			SELECT
				publisher.id AS "publisherId",
				publisher.name AS "publisherName",
				game.id AS "gameId",
				game.title AS "gameTitle",
				acquisition.price_currency AS currency,
				(COUNT(*) FILTER (WHERE acquisition.mechanism = 'user_paid'))::int AS "paidAcquisitionCount",
				COALESCE(SUM(acquisition.price_minor_unit_amount) FILTER (WHERE acquisition.mechanism = 'user_paid'), 0)::text AS "paidSalesMinorUnitAmount",
				(COUNT(*) FILTER (WHERE acquisition.mechanism = 'institution_funded'))::int AS "institutionFundedLicenseCount"
			FROM game_acquisition AS acquisition
			INNER JOIN game_license AS license ON license.id = acquisition.license_id
			INNER JOIN game_version AS game_version ON game_version.id = license.game_version_id
			INNER JOIN game ON game.id = game_version.game_id
			INNER JOIN publisher ON publisher.id = game.publisher_id
			WHERE acquisition.mechanism IN ('user_paid', 'institution_funded')${publisherDateFilter.clause}
			GROUP BY publisher.id, publisher.name, game.id, game.title, acquisition.price_currency
			ORDER BY publisher.name ASC, game.title ASC, acquisition.price_currency ASC
		`, publisherDateFilter.parameterList);

		const institutionReportRawList = await connection.execute<InstitutionReportRawRow[]>(`
			WITH license_metrics AS (
				SELECT
					acquisition.classroom_game_listing_id AS listing_id,
					(COUNT(*) FILTER (WHERE TRUE))::int AS license_count,
					(COUNT(DISTINCT acquisition.user_id))::int AS unique_licensee_count,
					(COUNT(*) FILTER (WHERE license.start_at <= now() AND license.end_at > now()))::int AS active_license_count,
					(COUNT(*) FILTER (WHERE license.start_at > now()))::int AS scheduled_license_count,
					(COUNT(*) FILTER (WHERE license.end_at <= now()))::int AS expired_license_count
				FROM game_acquisition AS acquisition
				INNER JOIN game_license AS license ON license.id = acquisition.license_id
				WHERE acquisition.mechanism = 'institution_funded'
					AND acquisition.classroom_game_listing_id IS NOT NULL${licenseDateFilter.clause}
				GROUP BY acquisition.classroom_game_listing_id
			), code_metrics AS (
				SELECT
					acquisition_code.classroom_game_listing_id AS listing_id,
					(COUNT(DISTINCT acquisition_code.id) FILTER (WHERE TRUE${codeCreatedDateFilter.clause}))::int AS code_issued_count,
					(COUNT(redemption.id) FILTER (WHERE redemption.id IS NOT NULL${redemptionDateFilter.clause}))::int AS code_redemption_count,
					(COUNT(DISTINCT redemption.redeemed_by_id) FILTER (WHERE redemption.id IS NOT NULL${redemptionDateFilter.clause}))::int AS unique_code_redeemer_count
				FROM acquisition_code
				LEFT JOIN acquisition_code_redemption AS redemption ON redemption.acquisition_code_id = acquisition_code.id
				WHERE acquisition_code.classroom_game_listing_id IS NOT NULL
				GROUP BY acquisition_code.classroom_game_listing_id
			)
			SELECT
				institution.id AS "institutionId",
				institution.name AS "institutionName",
				classroom.id AS "classroomId",
				classroom.name AS "classroomName",
				classroom_game_listing.id AS "listingId",
				game.title AS "gameTitle",
				publisher.name AS "publisherName",
				game_version.publisher_version AS "publisherVersion",
				classroom_game_listing.included_license_quantity AS "includedLicenseQuantity",
				COALESCE(license_metrics.license_count, 0)::int AS "institutionFundedLicenseCount",
				COALESCE(license_metrics.unique_licensee_count, 0)::int AS "uniqueLicenseeCount",
				COALESCE(license_metrics.active_license_count, 0)::int AS "activeLicenseCount",
				COALESCE(license_metrics.scheduled_license_count, 0)::int AS "scheduledLicenseCount",
				COALESCE(license_metrics.expired_license_count, 0)::int AS "expiredLicenseCount",
				COALESCE(code_metrics.code_issued_count, 0)::int AS "codeIssuedCount",
				COALESCE(code_metrics.code_redemption_count, 0)::int AS "codeRedemptionCount",
				COALESCE(code_metrics.unique_code_redeemer_count, 0)::int AS "uniqueCodeRedeemerCount"
			FROM classroom_game_listing
			INNER JOIN classroom ON classroom.id = classroom_game_listing.classroom_id
			INNER JOIN institution ON institution.id = classroom.institution_id
			INNER JOIN game_version ON game_version.id = classroom_game_listing.game_version_id
			INNER JOIN game ON game.id = game_version.game_id
			INNER JOIN publisher ON publisher.id = game.publisher_id
			LEFT JOIN license_metrics ON license_metrics.listing_id = classroom_game_listing.id
			LEFT JOIN code_metrics ON code_metrics.listing_id = classroom_game_listing.id
			WHERE classroom_game_listing.designated_payor = 'institution'
			ORDER BY institution.name ASC, classroom.name ASC, game.title ASC
		`, [
			...licenseDateFilter.parameterList,
			...codeCreatedDateFilter.parameterList,
			...redemptionDateFilter.parameterList,
			...redemptionDateFilter.parameterList,
		]);

		return {
			institutionReportList: institutionReportRawList.map((row) => ({
				activeLicenseCount: numberValue(row.activeLicenseCount),
				classroomId: row.classroomId,
				classroomName: row.classroomName,
				codeIssuedCount: numberValue(row.codeIssuedCount),
				codeRedemptionCount: numberValue(row.codeRedemptionCount),
				expiredLicenseCount: numberValue(row.expiredLicenseCount),
				gameTitle: row.gameTitle,
				includedLicenseQuantity: row.includedLicenseQuantity == null ? undefined : numberValue(row.includedLicenseQuantity),
				institutionFundedLicenseCount: numberValue(row.institutionFundedLicenseCount),
				institutionId: row.institutionId,
				institutionName: row.institutionName,
				listingId: row.listingId,
				publisherName: row.publisherName,
				publisherVersion: row.publisherVersion,
				scheduledLicenseCount: numberValue(row.scheduledLicenseCount),
				uniqueCodeRedeemerCount: numberValue(row.uniqueCodeRedeemerCount),
				uniqueLicenseeCount: numberValue(row.uniqueLicenseeCount),
			})),
			publisherReportList: publisherReportRawList.map((row) => ({
				currency: row.currency,
				gameId: row.gameId,
				gameTitle: row.gameTitle,
				institutionFundedLicenseCount: numberValue(row.institutionFundedLicenseCount),
				paidAcquisitionCount: numberValue(row.paidAcquisitionCount),
				paidSalesMinorUnitAmount: numberValue(row.paidSalesMinorUnitAmount),
				publisherId: row.publisherId,
				publisherName: row.publisherName,
			})),
		};
	}

}
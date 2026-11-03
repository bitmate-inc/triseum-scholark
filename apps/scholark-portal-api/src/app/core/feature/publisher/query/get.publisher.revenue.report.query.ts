import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable } from '@nestjs/common';

import { PublisherMember } from '../model/publisher.member.entity';

export enum PublisherRevenueInterval {
	DAY = 'day',
	WEEK = 'week',
	MONTH = 'month',
	YEAR = 'year',
}

export interface GetPublisherRevenueReportQueryData {
	from?: string;
	interval?: PublisherRevenueInterval;
	to?: string;
}

export interface PublisherRevenueReportItem {
	currency: string;
	gameId: string;
	gameTitle: string;
	institutionFundedLicenseCount: number;
	paidAcquisitionCount: number;
	paidSalesMinorUnitAmount: number;
	publisherId: string;
	publisherName: string;
}

export interface PublisherRevenueTimeSeriesItem {
	bucketStartAt: string;
	currency: string;
	paidAcquisitionCount: number;
	paidSalesMinorUnitAmount: number;
}

export interface GetPublisherRevenueReportQueryResult {
	reportList: PublisherRevenueReportItem[];
	timeSeriesList: PublisherRevenueTimeSeriesItem[];
	from: string;
	interval: PublisherRevenueInterval;
	to: string;
}

type RawNumber = number | string | null | undefined;

interface PublisherRevenueReportRawRow extends Omit<PublisherRevenueReportItem,
	'institutionFundedLicenseCount' | 'paidAcquisitionCount' | 'paidSalesMinorUnitAmount'> {
	institutionFundedLicenseCount: RawNumber;
	paidAcquisitionCount: RawNumber;
	paidSalesMinorUnitAmount: RawNumber;
}

interface PublisherRevenueTimeSeriesRawRow extends Omit<PublisherRevenueTimeSeriesItem,
	'paidAcquisitionCount' | 'paidSalesMinorUnitAmount'> {
	paidAcquisitionCount: RawNumber;
	paidSalesMinorUnitAmount: RawNumber;
}

const dateTruncUnitByInterval: Record<PublisherRevenueInterval, string> = {
	[PublisherRevenueInterval.DAY]: 'day',
	[PublisherRevenueInterval.WEEK]: 'week',
	[PublisherRevenueInterval.MONTH]: 'month',
	[PublisherRevenueInterval.YEAR]: 'year',
};

function numberValue(value: RawNumber): number {
	return Number(value ?? 0);
}

function dateValue(value: string): Date {
	return new Date(`${value}T00:00:00.000Z`);
}

function dateString(value: Date): string {
	return value.toISOString().slice(0, 10);
}

function getDateRange(data: GetPublisherRevenueReportQueryData): { from: string; to: string } {
	const to = data.to ?? dateString(new Date());
	const fromDate = dateValue(to);
	fromDate.setUTCDate(fromDate.getUTCDate() - 29);
	const from = data.from ?? dateString(fromDate);

	if (from > to) {
		throw new BadRequestException('The start date must be on or before the end date.');
	}

	return { from, to };
}

@Injectable()
export class GetPublisherRevenueReportQuery {

	constructor(private readonly entityManager: EntityManager) {}

	async hasAccess(userId: string): Promise<boolean> {
		const memberCount = await this.entityManager.count(PublisherMember, { user: userId });
		return memberCount > 0;
	}

	async execute(
		userId: string,
		data: GetPublisherRevenueReportQueryData = {},
	): Promise<GetPublisherRevenueReportQueryResult> {
		const { from, to } = getDateRange(data);
		const interval = data.interval ?? PublisherRevenueInterval.DAY;
		const dateTruncUnit = dateTruncUnitByInterval[interval];
		const connection = this.entityManager.getConnection();
		const reportRawList = await connection.execute<PublisherRevenueReportRawRow[]>(`
			SELECT
				publisher.id AS "publisherId",
				publisher.name AS "publisherName",
				game.id AS "gameId",
				game.title AS "gameTitle",
				COALESCE(acquisition.price_currency, 'USD') AS currency,
				(COUNT(acquisition.id) FILTER (WHERE acquisition.mechanism = 'user_paid'))::int AS "paidAcquisitionCount",
				COALESCE(SUM(acquisition.price_minor_unit_amount) FILTER (WHERE acquisition.mechanism = 'user_paid'), 0)::text AS "paidSalesMinorUnitAmount",
				(COUNT(acquisition.id) FILTER (WHERE acquisition.mechanism = 'institution_funded'))::int AS "institutionFundedLicenseCount"
			FROM game
			INNER JOIN publisher ON publisher.id = game.publisher_id
			LEFT JOIN game_version AS game_version ON game_version.game_id = game.id
			LEFT JOIN game_license AS license ON license.game_version_id = game_version.id
			LEFT JOIN game_acquisition AS acquisition
				ON acquisition.license_id = license.id
				AND acquisition.mechanism IN ('user_paid', 'institution_funded')
				AND acquisition.created_at >= (?::date::timestamp AT TIME ZONE 'UTC')
				AND acquisition.created_at < ((?::date + interval '1 day') AT TIME ZONE 'UTC')
			WHERE EXISTS (
				SELECT 1
				FROM publisher_member AS publisher_member
				WHERE publisher_member.publisher_id = publisher.id
					AND publisher_member.user_id = ?
			)
			GROUP BY publisher.id, publisher.name, game.id, game.title, COALESCE(acquisition.price_currency, 'USD')
			ORDER BY publisher.name ASC, game.title ASC, currency ASC
		`, [from, to, userId]);

		const bucketExpression = `date_trunc('${dateTruncUnit}', acquisition.created_at AT TIME ZONE 'UTC')::date`;
		const timeSeriesRawList = await connection.execute<PublisherRevenueTimeSeriesRawRow[]>(`
			SELECT
				to_char(${bucketExpression}, 'YYYY-MM-DD') AS "bucketStartAt",
				acquisition.price_currency AS currency,
				COUNT(*)::int AS "paidAcquisitionCount",
				COALESCE(SUM(acquisition.price_minor_unit_amount), 0)::text AS "paidSalesMinorUnitAmount"
			FROM game_acquisition AS acquisition
			INNER JOIN game_license AS license ON license.id = acquisition.license_id
			INNER JOIN game_version AS game_version ON game_version.id = license.game_version_id
			INNER JOIN game ON game.id = game_version.game_id
			INNER JOIN publisher ON publisher.id = game.publisher_id
			WHERE acquisition.mechanism = 'user_paid'
				AND acquisition.created_at >= (?::date::timestamp AT TIME ZONE 'UTC')
				AND acquisition.created_at < ((?::date + interval '1 day') AT TIME ZONE 'UTC')
				AND EXISTS (
					SELECT 1
					FROM publisher_member AS publisher_member
					WHERE publisher_member.publisher_id = publisher.id
						AND publisher_member.user_id = ?
				)
			GROUP BY ${bucketExpression}, acquisition.price_currency
			ORDER BY "bucketStartAt" ASC, currency ASC
		`, [from, to, userId]);

		return {
			from,
			interval,
			reportList: reportRawList.map((row) => ({
				currency: row.currency,
				gameId: row.gameId,
				gameTitle: row.gameTitle,
				institutionFundedLicenseCount: numberValue(row.institutionFundedLicenseCount),
				paidAcquisitionCount: numberValue(row.paidAcquisitionCount),
				paidSalesMinorUnitAmount: numberValue(row.paidSalesMinorUnitAmount),
				publisherId: row.publisherId,
				publisherName: row.publisherName,
			})),
			timeSeriesList: timeSeriesRawList.map((row) => ({
				bucketStartAt: row.bucketStartAt,
				currency: row.currency,
				paidAcquisitionCount: numberValue(row.paidAcquisitionCount),
				paidSalesMinorUnitAmount: numberValue(row.paidSalesMinorUnitAmount),
			})),
			to,
		};
	}

}
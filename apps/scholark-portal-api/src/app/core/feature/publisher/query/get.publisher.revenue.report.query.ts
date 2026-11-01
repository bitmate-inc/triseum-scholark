import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { PublisherMember } from '../model/publisher.member.entity';

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

export interface GetPublisherRevenueReportQueryResult {
	reportList: PublisherRevenueReportItem[];
}

type RawNumber = number | string | null | undefined;

interface PublisherRevenueReportRawRow extends Omit<PublisherRevenueReportItem,
	'institutionFundedLicenseCount' | 'paidAcquisitionCount' | 'paidSalesMinorUnitAmount'> {
	institutionFundedLicenseCount: RawNumber;
	paidAcquisitionCount: RawNumber;
	paidSalesMinorUnitAmount: RawNumber;
}

function numberValue(value: RawNumber): number {
	return Number(value ?? 0);
}

@Injectable()
export class GetPublisherRevenueReportQuery {

	constructor(private readonly entityManager: EntityManager) {}

	async hasAccess(userId: string): Promise<boolean> {
		const memberCount = await this.entityManager.count(PublisherMember, { user: userId });
		return memberCount > 0;
	}

	async execute(userId: string): Promise<GetPublisherRevenueReportQueryResult> {
		const connection = this.entityManager.getConnection();
		const rawList = await connection.execute<PublisherRevenueReportRawRow[]>(`
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
			WHERE EXISTS (
				SELECT 1
				FROM publisher_member AS publisher_member
				WHERE publisher_member.publisher_id = publisher.id
					AND publisher_member.user_id = ?
			)
			GROUP BY publisher.id, publisher.name, game.id, game.title, COALESCE(acquisition.price_currency, 'USD')
			ORDER BY publisher.name ASC, game.title ASC, currency ASC
		`, [userId]);

		return {
			reportList: rawList.map((row) => ({
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
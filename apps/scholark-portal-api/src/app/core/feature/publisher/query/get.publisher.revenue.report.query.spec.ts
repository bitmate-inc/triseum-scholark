import { EntityManager } from '@mikro-orm/postgresql';

import { PublisherMember } from '../model/publisher.member.entity';
import { GetPublisherRevenueReportQuery } from './get.publisher.revenue.report.query';

describe(GetPublisherRevenueReportQuery.name, () => {
	it('returns per-game revenue scoped to the current user publisher memberships', async () => {
		const execute = jest.fn().mockResolvedValue([{
			currency: 'USD',
			gameId: 'game-id',
			gameTitle: 'History Game',
			institutionFundedLicenseCount: '3',
			paidAcquisitionCount: '2',
			paidSalesMinorUnitAmount: '4900',
			publisherId: 'publisher-id',
			publisherName: 'Example Publisher',
		}]);
		const entityManager = {
			getConnection: () => ({ execute }),
		} as unknown as EntityManager;
		const query = new GetPublisherRevenueReportQuery(entityManager);

		const result = await query.execute('user-id');

		expect(result.reportList[0]).toEqual({
			currency: 'USD',
			gameId: 'game-id',
			gameTitle: 'History Game',
			institutionFundedLicenseCount: 3,
			paidAcquisitionCount: 2,
			paidSalesMinorUnitAmount: 4900,
			publisherId: 'publisher-id',
			publisherName: 'Example Publisher',
		});
		expect(execute.mock.calls[0][0]).toContain('publisher_member.user_id = ?');
		expect(execute.mock.calls[0][0]).toContain('LEFT JOIN game_acquisition');
		expect(execute.mock.calls[0][1]).toEqual(['user-id']);
	});

	it('checks whether a user belongs to at least one publisher', async () => {
		const count = jest.fn().mockResolvedValue(1);
		const entityManager = { count } as unknown as EntityManager;
		const query = new GetPublisherRevenueReportQuery(entityManager);

		await expect(query.hasAccess('user-id')).resolves.toBe(true);
		expect(count).toHaveBeenCalledWith(PublisherMember, { user: 'user-id' });
	});
});
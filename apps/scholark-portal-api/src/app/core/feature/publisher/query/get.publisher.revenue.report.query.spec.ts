import { EntityManager } from '@mikro-orm/postgresql';

import { PublisherMember } from '../model/publisher.member.entity';
import { GetPublisherRevenueReportQuery, PublisherRevenueInterval } from './get.publisher.revenue.report.query';

describe(GetPublisherRevenueReportQuery.name, () => {
	it('returns per-game revenue and time buckets within the membership-scoped date range', async () => {
		const execute = jest.fn()
			.mockResolvedValueOnce([{
				currency: 'USD',
				gameId: 'game-id',
				gameTitle: 'History Game',
				institutionFundedLicenseCount: '3',
				paidAcquisitionCount: '2',
				paidSalesMinorUnitAmount: '4900',
				publisherId: 'publisher-id',
				publisherName: 'Example Publisher',
			}])
			.mockResolvedValueOnce([{
				bucketStartAt: '2026-10-05',
				currency: 'USD',
				paidAcquisitionCount: '2',
				paidSalesMinorUnitAmount: '4900',
			}]);
		const entityManager = {
			getConnection: () => ({ execute }),
		} as unknown as EntityManager;
		const query = new GetPublisherRevenueReportQuery(entityManager);

		const result = await query.execute('user-id', {
			from: '2026-10-01',
			interval: PublisherRevenueInterval.WEEK,
			to: '2026-10-31',
		});

		expect(result.from).toBe('2026-10-01');
		expect(result.interval).toBe(PublisherRevenueInterval.WEEK);
		expect(result.to).toBe('2026-10-31');
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
		expect(result.timeSeriesList[0]).toEqual({
			bucketStartAt: '2026-10-05',
			currency: 'USD',
			paidAcquisitionCount: 2,
			paidSalesMinorUnitAmount: 4900,
		});
		expect(execute.mock.calls[0][0]).toContain('publisher_member.user_id = ?');
		expect(execute.mock.calls[0][0]).toContain('LEFT JOIN game_acquisition');
		expect(execute.mock.calls[0][1]).toEqual(['2026-10-01', '2026-10-31', 'user-id']);
		expect(execute.mock.calls[1][0]).toContain("date_trunc('week'");
		expect(execute.mock.calls[1][0]).toContain('publisher_member.user_id = ?');
		expect(execute.mock.calls[1][1]).toEqual(['2026-10-01', '2026-10-31', 'user-id']);
		expect(execute).toHaveBeenCalledTimes(2);
	});

	it('defaults to daily revenue for the last 30 days', async () => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2026-10-31T12:00:00.000Z'));

		try {
			const execute = jest.fn().mockResolvedValue([]);
			const entityManager = {
				getConnection: () => ({ execute }),
			} as unknown as EntityManager;
			const query = new GetPublisherRevenueReportQuery(entityManager);
			const result = await query.execute('user-id');

			expect(result).toMatchObject({
				from: '2026-10-02',
				interval: PublisherRevenueInterval.DAY,
				to: '2026-10-31',
			});
			expect(execute.mock.calls[0][1]).toEqual(['2026-10-02', '2026-10-31', 'user-id']);
		} finally {
			jest.useRealTimers();
		}
	});

	it('rejects a reversed date range before querying the database', async () => {
		const execute = jest.fn();
		const entityManager = {
			getConnection: () => ({ execute }),
		} as unknown as EntityManager;
		const query = new GetPublisherRevenueReportQuery(entityManager);

		await expect(query.execute('user-id', { from: '2026-10-31', to: '2026-10-01' })).rejects.toThrow(
			'The start date must be on or before the end date.',
		);
		expect(execute).not.toHaveBeenCalled();
	});

	it('checks whether a user belongs to at least one publisher', async () => {
		const count = jest.fn().mockResolvedValue(1);
		const entityManager = { count } as unknown as EntityManager;
		const query = new GetPublisherRevenueReportQuery(entityManager);

		await expect(query.hasAccess('user-id')).resolves.toBe(true);
		expect(count).toHaveBeenCalledWith(PublisherMember, { user: 'user-id' });
	});
});
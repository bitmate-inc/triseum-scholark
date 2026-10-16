import { EntityRepository } from '@mikro-orm/postgresql';

import { GameAcquisition } from '../../game/model/game.acquisition.entity';
import { GetAdminAcquisitionReportQuery } from './get.admin.acquisition.report.query';

describe(GetAdminAcquisitionReportQuery.name, () => {
	it('returns publisher sales and institution license metrics for the selected date range', async () => {
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
				activeLicenseCount: '1',
				classroomId: 'classroom-id',
				classroomName: 'History 101',
				codeIssuedCount: '5',
				codeRedemptionCount: '3',
				expiredLicenseCount: '1',
				gameTitle: 'History Game',
				includedLicenseQuantity: '10',
				institutionFundedLicenseCount: '3',
				institutionId: 'institution-id',
				institutionName: 'Example College',
				listingId: 'listing-id',
				publisherName: 'Example Publisher',
				publisherVersion: '1.0',
				scheduledLicenseCount: '1',
				uniqueCodeRedeemerCount: '3',
				uniqueLicenseeCount: '3',
			}]);
		const acquisitionRepository = {
			getEntityManager: () => ({ getConnection: () => ({ execute }) }),
		} as unknown as EntityRepository<GameAcquisition>;
		const query = new GetAdminAcquisitionReportQuery(acquisitionRepository);

		const result = await query.execute({ from: '2026-10-01', to: '2026-10-31' });

		expect(result.publisherReportList[0]).toMatchObject({
			paidAcquisitionCount: 2,
			paidSalesMinorUnitAmount: 4900,
			institutionFundedLicenseCount: 3,
		});
		expect(result.institutionReportList[0]).toMatchObject({
			codeIssuedCount: 5,
			codeRedemptionCount: 3,
			institutionFundedLicenseCount: 3,
			includedLicenseQuantity: 10,
			uniqueLicenseeCount: 3,
		});
		expect(execute).toHaveBeenCalledTimes(2);
		expect(execute.mock.calls[0][1]).toEqual(['2026-10-01', '2026-10-31']);
		expect(execute.mock.calls[1][0]).toContain('COUNT(DISTINCT acquisition_code.id)');
		expect(execute.mock.calls[1][1]).toEqual([
			'2026-10-01', '2026-10-31',
			'2026-10-01', '2026-10-31',
			'2026-10-01', '2026-10-31',
			'2026-10-01', '2026-10-31',
		]);
	});

	it('rejects a reversed date range before querying the database', async () => {
		const execute = jest.fn();
		const acquisitionRepository = {
			getEntityManager: () => ({ getConnection: () => ({ execute }) }),
		} as unknown as EntityRepository<GameAcquisition>;
		const query = new GetAdminAcquisitionReportQuery(acquisitionRepository);

		await expect(query.execute({ from: '2026-10-31', to: '2026-10-01' })).rejects.toThrow(
			'The start date must be on or before the end date.',
		);
		expect(execute).not.toHaveBeenCalled();
	});
});
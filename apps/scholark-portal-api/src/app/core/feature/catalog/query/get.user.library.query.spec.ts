import { GameAcquisition } from '../../game/model/game.acquisition.entity';
import { GameLicense } from '../../game/model/game.license.entity';
import { GameProgressSnapshot } from '../../game/model/game.progress.snapshot.entity';
import { GetUserLibraryQuery } from './get.user.library.query';

describe(GetUserLibraryQuery.name, () => {
	it('returns progress snapshots matched to each license in one bulk query', async () => {
		const license = {
			createdAt: new Date('2026-01-01T00:00:00.000Z'),
			endAt: new Date('2027-01-01T00:00:00.000Z'),
			id: 'license-1',
			isActive: () => true,
			startAt: new Date('2026-01-01T00:00:00.000Z'),
		} as unknown as GameLicense;
		const acquisition = { id: 'acquisition-1', license } as GameAcquisition;
		const progressSnapshot = {
			content: { summary: { completionPercent: 54 } },
			gameLicense: license,
			schemaVersion: 1,
		} as GameProgressSnapshot;
		const entityManager = {
			find: jest.fn(async (entity: unknown) => {
				if (entity === GameLicense) return [license];
				if (entity === GameAcquisition) return [acquisition];
				if (entity === GameProgressSnapshot) return [progressSnapshot];
				return [];
			}),
		};
		const query = new GetUserLibraryQuery(entityManager as never);

		const result = await query.execute('user-1');

		expect(result).toEqual([{ license, acquisition, progressSnapshot }]);
		expect(entityManager.find).toHaveBeenCalledWith(GameProgressSnapshot, {
			gameLicense: { $in: [license] },
		});
	});
});
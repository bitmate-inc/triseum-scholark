import { ClassroomGameGradingRule } from '../../education/model/classroom.game.grading.rule.entity';
import { GameGradeResult } from '../../education/model/game.grade.result.entity';
import { getGameProgressSnapshotHash } from '../../education/service/game.progress.snapshot.hash';
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

	it('returns only the latest-rule grade result for the current snapshot', async () => {
		const classroomGameListing = { id: 'listing-1' };
		const license = {
			classroomGameListing,
			createdAt: new Date('2026-01-01T00:00:00.000Z'),
			endAt: new Date('2027-01-01T00:00:00.000Z'),
			id: 'license-1',
			isActive: () => true,
			startAt: new Date('2026-01-01T00:00:00.000Z'),
		} as unknown as GameLicense;
		const progressSnapshot = {
			content: { summary: { completionPercent: 54 } },
			gameLicense: license,
			schemaVersion: 1,
		} as GameProgressSnapshot;
		const latestGradingRule = { classroomGameListing, id: 'rule-2', revision: 2 } as ClassroomGameGradingRule;
		const olderGradingRule = { classroomGameListing, id: 'rule-1', revision: 1 } as ClassroomGameGradingRule;
		const currentGradeResult = {
			content: { scoreGiven: 80, scoreMaximum: 100 },
			createdAt: new Date('2026-02-02T00:00:00.000Z'),
			gameLicense: license,
			gradingRule: latestGradingRule,
			sourceProgressHash: getGameProgressSnapshotHash(progressSnapshot.schemaVersion, progressSnapshot.content),
		} as GameGradeResult;
		const staleGradeResult = {
			...currentGradeResult,
			createdAt: new Date('2026-02-03T00:00:00.000Z'),
			sourceProgressHash: 'stale-progress-hash',
		} as GameGradeResult;
		const entityManager = {
			find: jest.fn(async (entity: unknown) => {
				if (entity === GameLicense) return [license];
				if (entity === GameProgressSnapshot) return [progressSnapshot];
				if (entity === ClassroomGameGradingRule) return [latestGradingRule, olderGradingRule];
				if (entity === GameGradeResult) return [staleGradeResult, currentGradeResult];
				return [];
			}),
		};
		const query = new GetUserLibraryQuery(entityManager as never);

		const result = await query.execute('user-1');

		expect(result[0].gradeResult).toBe(currentGradeResult);
		expect(entityManager.find).toHaveBeenCalledWith(
			GameGradeResult,
			{ gameLicense: { $in: [license] }, gradingRule: { $in: [latestGradingRule] } },
			{ orderBy: { sourceProgressUpdatedAt: 'DESC', createdAt: 'DESC' }, populate: ['gradingRule'] },
		);
	});
});
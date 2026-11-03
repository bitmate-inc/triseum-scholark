import { GameLicense } from '../../game/model/game.license.entity';
import { GameProgressSnapshot } from '../../game/model/game.progress.snapshot.entity';
import { ClassroomGameGradingRule } from '../model/classroom.game.grading.rule.entity';
import { ClassroomGameListing } from '../model/classroom.game.listing.entity';
import { GameGradeResult } from '../model/game.grade.result.entity';
import { getCurrentOrFrozenGradeResultByLicenseId, getEffectiveClassroomGameGradingRuleList } from './classroom.game.grade.lifecycle';
import { getGameProgressSnapshotHash } from './game.progress.snapshot.hash';

describe('classroom game grade lifecycle', () => {
	const cutoffAt = new Date('2026-11-02T00:00:00.000Z');
	const classroomGameListing = { endAt: cutoffAt, id: 'listing-1' } as ClassroomGameListing;

	it('uses the latest grading rule created on or before listing expiry', () => {
		const beforeExpiryRule = {
			classroomGameListing,
			createdAt: new Date(cutoffAt.getTime() - 1),
			id: 'rule-1',
			revision: 1,
		} as ClassroomGameGradingRule;
		const afterExpiryRule = {
			classroomGameListing,
			createdAt: new Date(cutoffAt.getTime() + 1),
			id: 'rule-2',
			revision: 2,
		} as ClassroomGameGradingRule;

		expect(getEffectiveClassroomGameGradingRuleList(
			[afterExpiryRule, beforeExpiryRule],
			[classroomGameListing],
		)).toEqual([beforeExpiryRule]);
	});

	it('keeps grades live before expiry and freezes the latest eligible result afterward', () => {
		const license = {
			classroomGameListing,
			id: 'license-1',
		} as GameLicense;
		const beforeExpiryContent = { summary: { completionPercent: 70 } };
		const afterExpiryContent = { summary: { completionPercent: 100 } };
		const progressSnapshot = {
			content: afterExpiryContent,
			gameLicense: license,
			schemaVersion: 1,
			updatedAt: new Date(cutoffAt.getTime() + 1),
		} as GameProgressSnapshot;
		const frozenGradeResult = {
			createdAt: new Date(cutoffAt.getTime() - 2),
			gameLicense: license,
			sourceProgressHash: getGameProgressSnapshotHash(1, beforeExpiryContent),
			sourceProgressUpdatedAt: new Date(cutoffAt.getTime() - 2),
		} as GameGradeResult;
		const postExpiryGradeResult = {
			createdAt: new Date(cutoffAt.getTime() + 2),
			gameLicense: license,
			sourceProgressHash: getGameProgressSnapshotHash(1, afterExpiryContent),
			sourceProgressUpdatedAt: new Date(cutoffAt.getTime() + 1),
		} as GameGradeResult;

		expect(getCurrentOrFrozenGradeResultByLicenseId(
			[frozenGradeResult, postExpiryGradeResult],
			[license],
			[progressSnapshot],
			new Date(cutoffAt.getTime() - 1),
		).get(license.id!)).toBe(postExpiryGradeResult);
		expect(getCurrentOrFrozenGradeResultByLicenseId(
			[frozenGradeResult, postExpiryGradeResult],
			[license],
			[progressSnapshot],
			new Date(cutoffAt.getTime() + 3),
		).get(license.id!)).toBe(frozenGradeResult);
	});
});
import type { GameProgressStructure } from '../../game/model/game.progress.structure';
import { ClassroomGameGradingMethod } from '../model/classroom.game.grading.rule.entity';
import { calculateClassroomGameGrade } from './classroom.game.grading.calculator';

const progressStructure: GameProgressStructure = {
	schemaVersion: 1,
	sectionList: [
		{ sectionIndex: '0', label: 'Act 1', metricList: [{ key: 'points', label: 'Points', pointsPossible: 120 }] },
		{ sectionIndex: '0.0', label: 'Scene 1', metricList: [{ key: 'points', label: 'Points', pointsPossible: 60 }] },
		{ sectionIndex: '1', label: 'Act 2', metricList: [{ key: 'points', label: 'Points', pointsPossible: 40 }] },
	],
};

describe(calculateClassroomGameGrade.name, () => {
	it('maps selected section points to the configured LMS maximum', () => {
		const result = calculateClassroomGameGrade(1, progressStructure, {
			sectionList: [
				{ sectionIndex: '0', metrics: { points: 120 } },
				{ sectionIndex: '0.0', metrics: { points: 40.5 } },
				{ sectionIndex: '1', metrics: { points: 20 } },
			],
			summary: { completed: true },
		}, {
			allowPartial: false,
			method: ClassroomGameGradingMethod.POINTS,
			progressSchemaVersion: 1,
			schemaVersion: 1,
			scoreMaximum: 100,
			sectionIndexList: ['0.0', '1'],
		});

		expect(result).toMatchObject({
			activityProgress: 'completed',
			gradingProgress: 'fully_graded',
			scoreGiven: 60.5,
			scoreMaximum: 100,
			percentage: 60.5,
		});
		expect(result.sectionResultList).toHaveLength(2);
	});

	it('keeps missing points ungraded instead of treating them as zero', () => {
		const missingMetricStructure: GameProgressStructure = {
			schemaVersion: 1,
			sectionList: [{ sectionIndex: '0', label: 'Level 1', metricList: [{ key: 'points', label: 'Points', pointsPossible: 100 }] }],
		};
		const result = calculateClassroomGameGrade(1, missingMetricStructure, {
			sectionList: [{ sectionIndex: '0', metrics: { points: null } }],
			summary: { completed: true },
		}, {
			allowPartial: false,
			method: ClassroomGameGradingMethod.POINTS,
			progressSchemaVersion: 1,
			schemaVersion: 1,
			scoreMaximum: 100,
			sectionIndexList: ['0'],
		});

		expect(result).toMatchObject({ scoreGiven: null, gradingProgress: 'not_ready' });
	});

	it('keeps completion unknown as not ready instead of pending', () => {
		const result = calculateClassroomGameGrade(1, progressStructure, {
			sectionList: [{ sectionIndex: '0', metrics: {} }],
		}, {
			allowPartial: false,
			method: ClassroomGameGradingMethod.POINTS,
			progressSchemaVersion: 1,
			schemaVersion: 1,
			scoreMaximum: 100,
			sectionIndexList: ['0'],
		});

		expect(result).toMatchObject({ activityProgress: 'unknown', gradingProgress: 'not_ready', scoreGiven: null });
	});

	it('returns a pending partial score only when the rule permits it', () => {
		const result = calculateClassroomGameGrade(1, progressStructure, {
			sectionList: [{ sectionIndex: '0', metrics: { points: 25 }, completed: false }],
		}, {
			allowPartial: true,
			method: ClassroomGameGradingMethod.POINTS,
			progressSchemaVersion: 1,
			schemaVersion: 1,
			scoreMaximum: 100,
			sectionIndexList: ['0'],
		});

		expect(result).toMatchObject({ activityProgress: 'in_progress', gradingProgress: 'pending' });
		expect(result.scoreGiven).toBeCloseTo(25 / 120 * 100);
	});

	it('uses the explicit completion threshold only after completion is reported', () => {
		const summaryOnlyStructure: GameProgressStructure = { schemaVersion: 1, sectionList: [] };
		const result = calculateClassroomGameGrade(1, summaryOnlyStructure, {
			summary: { completionPercent: 60 },
		}, {
			allowPartial: false,
			completionThresholdPercent: 60,
			method: ClassroomGameGradingMethod.COMPLETION_THRESHOLD,
			progressSchemaVersion: 1,
			schemaVersion: 1,
			scoreMaximum: 100,
			sectionIndexList: [],
		});

		expect(result).toMatchObject({ scoreGiven: 100, gradingProgress: 'fully_graded' });
	});

	it('rejects a rule for a different source progress schema', () => {
		const result = calculateClassroomGameGrade(2, progressStructure, { summary: { completed: true } }, {
			allowPartial: false,
			method: ClassroomGameGradingMethod.POINTS,
			progressSchemaVersion: 1,
			schemaVersion: 1,
			scoreMaximum: 100,
			sectionIndexList: ['0'],
		});

		expect(result.gradingProgress).toBe('incompatible');
	});

	it('rejects parent and child sections selected together to prevent double-counting', () => {
		const hierarchyStructure: GameProgressStructure = {
			schemaVersion: 1,
			sectionList: [
				{ sectionIndex: '0', label: 'Act 1', metricList: [{ key: 'points', label: 'Points', pointsPossible: 100 }] },
				{ sectionIndex: '0.0', label: 'Scene 1', metricList: [{ key: 'points', label: 'Points', pointsPossible: 50 }] },
			],
		};
		const result = calculateClassroomGameGrade(1, hierarchyStructure, {
			sectionList: [
				{ sectionIndex: '0', metrics: { points: 80 } },
				{ sectionIndex: '0.0', metrics: { points: 40 } },
			],
			summary: { completed: true },
		}, {
			allowPartial: false,
			method: ClassroomGameGradingMethod.POINTS,
			progressSchemaVersion: 1,
			schemaVersion: 1,
			scoreMaximum: 100,
			sectionIndexList: ['0', '0.0'],
		});

		expect(result.gradingProgress).toBe('incompatible');
	});
});
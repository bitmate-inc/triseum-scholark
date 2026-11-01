import type { GameProgressSnapshotContent } from '../../game/model/game.progress.snapshot.entity';
import type { GameProgressStructure } from '../../game/model/game.progress.structure';
import { ClassroomGameGradingMethod, type ClassroomGameGradingRuleConfig } from '../model/classroom.game.grading.rule.entity';
import type {
	GameGradeActivityProgress,
	GameGradeResultContent,
	GameGradeSectionResult,
} from '../model/game.grade.result.entity';

export function calculateClassroomGameGrade(
	progressSchemaVersion: number,
	progressStructure: GameProgressStructure | undefined,
	progressContent: GameProgressSnapshotContent,
	config: ClassroomGameGradingRuleConfig,
): GameGradeResultContent {
	const progressSectionList = progressContent.sectionList ?? [];
	const sectionDefinitionList = progressStructure?.sectionList ?? [];
	const selectedSectionDefinitionList = sectionDefinitionList.filter((section) =>
		config.sectionIndexList.includes(section.sectionIndex),
	);
	const progressSectionByIndex = new Map(progressSectionList.map((section) => [section.sectionIndex, section]));
	const selectedProgressSectionList = progressSectionList.filter((section) =>
		config.sectionIndexList.includes(section.sectionIndex),
	);
	const activityProgress = resolveActivityProgress(progressContent, selectedProgressSectionList);
	const result: GameGradeResultContent = {
		activityProgress,
		scoreGiven: null,
		scoreMaximum: config.scoreMaximum,
		percentage: null,
		gradingProgress: 'not_ready',
		sectionResultList: [],
	};

	if (!progressStructure
		|| progressSchemaVersion !== config.progressSchemaVersion
		|| progressSchemaVersion !== progressStructure.schemaVersion
		|| config.sectionIndexList.some((sectionIndex) => !sectionDefinitionList.some((section) => section.sectionIndex === sectionIndex))
		|| (config.method === ClassroomGameGradingMethod.POINTS && config.sectionIndexList.length === 0)) {
		result.gradingProgress = 'incompatible';
		return result;
	}
	if (config.method === ClassroomGameGradingMethod.POINTS && hasOverlappingSectionSelection(config.sectionIndexList)) {
		result.gradingProgress = 'incompatible';
		return result;
	}

	if (config.method === ClassroomGameGradingMethod.COMPLETION_THRESHOLD) {
		return calculateCompletionThresholdGrade(progressContent, config, result);
	}

	const sectionResultList: GameGradeSectionResult[] = [];
	for (const sectionDefinition of selectedSectionDefinitionList) {
		const progressSection = progressSectionByIndex.get(sectionDefinition.sectionIndex);
		if (!progressSection) {
			return result;
		}
		const gradeMetricDefinitionList = sectionDefinition.metricList.filter((metric) => metric.pointsPossible !== undefined);
		if (gradeMetricDefinitionList.length === 0) {
			result.gradingProgress = 'incompatible';
			return result;
		}

		let sectionPoints = 0;
		let sectionPointsPossible = 0;
		for (const metricDefinition of gradeMetricDefinitionList) {
			const metricValue = progressSection.metrics?.[metricDefinition.key];
			if (typeof metricValue !== 'number' || !Number.isFinite(metricValue) || metricDefinition.pointsPossible === undefined) {
				return result;
			}
			sectionPoints += metricValue;
			sectionPointsPossible += metricDefinition.pointsPossible;
		}

		sectionResultList.push({
			sectionIndex: sectionDefinition.sectionIndex,
			label: sectionDefinition.label,
			points: sectionPoints,
			pointsPossible: sectionPointsPossible,
			percentage: sectionPoints / sectionPointsPossible * 100,
		});
	}

	const points = sectionResultList.reduce((total, section) => total + section.points, 0);
	const pointsPossible = sectionResultList.reduce((total, section) => total + section.pointsPossible, 0);
	const percentage = points / pointsPossible * 100;
	const complete = activityProgress === 'completed';
	result.sectionResultList = sectionResultList;
	result.percentage = percentage;

	if (!complete && !config.allowPartial) {
		result.gradingProgress = activityProgress === 'unknown' ? 'not_ready' : 'pending';
		return result;
	}

	result.scoreGiven = percentage / 100 * config.scoreMaximum;
	result.gradingProgress = complete ? 'fully_graded' : 'pending';
	return result;
}

function hasOverlappingSectionSelection(sectionIndexList: string[]): boolean {
	return sectionIndexList.some((sectionIndex) => sectionIndexList.some((parentSectionIndex) =>
		sectionIndex !== parentSectionIndex && sectionIndex.startsWith(`${parentSectionIndex}.`),
	));
}

function calculateCompletionThresholdGrade(
	progressContent: GameProgressSnapshotContent,
	config: ClassroomGameGradingRuleConfig,
	result: GameGradeResultContent,
): GameGradeResultContent {
	const completionPercent = progressContent.summary?.completionPercent;
	if (typeof completionPercent !== 'number' || !Number.isFinite(completionPercent)
		|| config.completionThresholdPercent === undefined) {
		return result;
	}
	if (progressContent.summary?.completed === undefined || progressContent.summary.completed === null) {
		result.activityProgress = completionPercent >= config.completionThresholdPercent ? 'completed' : 'in_progress';
	}
	if (result.activityProgress === 'unknown') {
		return result;
	}
	if (result.activityProgress !== 'completed') {
		result.gradingProgress = 'pending';
		return result;
	}

	result.scoreGiven = completionPercent >= config.completionThresholdPercent ? config.scoreMaximum : 0;
	result.percentage = result.scoreGiven / config.scoreMaximum * 100;
	result.gradingProgress = 'fully_graded';
	return result;
}

function resolveActivityProgress(
	progressContent: GameProgressSnapshotContent,
	sectionList: NonNullable<GameProgressSnapshotContent['sectionList']>,
): GameGradeActivityProgress {
	if (progressContent.summary?.completed !== undefined && progressContent.summary.completed !== null) {
		return progressContent.summary.completed ? 'completed' : 'in_progress';
	}
	if (sectionList.length && sectionList.every((section) => section.completed === true)) {
		return 'completed';
	}
	if (sectionList.some((section) => section.completed === false
		|| section.completionPercent != null
		|| Object.values(section.metrics ?? {}).some((metricValue) => metricValue !== null))) {
		return 'in_progress';
	}
	return 'unknown';
}
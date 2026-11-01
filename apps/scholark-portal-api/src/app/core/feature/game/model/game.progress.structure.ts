export type GameProgressMetricDefinition = {
	key: string;
	label: string;
	pointsPossible?: number;
};

export type GameProgressSectionDefinition = {
	sectionIndex: string;
	label: string;
	metricList: GameProgressMetricDefinition[];
};

export type GameProgressStructure = {
	schemaVersion: number;
	sectionList: GameProgressSectionDefinition[];
};

const sectionIndexPattern = /^(0|[1-9]\d*)(\.(0|[1-9]\d*))*$/;

export function getParentSectionIndex(sectionIndex: string): string | undefined {
	const separatorIndex = sectionIndex.lastIndexOf('.');
	return separatorIndex < 0 ? undefined : sectionIndex.slice(0, separatorIndex);
}

export function validateGameProgressStructure(structure: GameProgressStructure): string | undefined {
	if (!Number.isInteger(structure.schemaVersion) || structure.schemaVersion < 1) {
		return 'Progress structure schema version must be a positive integer.';
	}
	if (!Array.isArray(structure.sectionList) || structure.sectionList.length > 1000) {
		return 'Progress structure must contain at most 1000 sections.';
	}

	const sectionByIndex = new Map<string, GameProgressSectionDefinition>();
	for (const section of structure.sectionList) {
		if (!sectionIndexPattern.test(section.sectionIndex)) {
			return `Invalid section index: ${section.sectionIndex}.`;
		}
		if (!section.label.trim() || section.label.length > 200) {
			return `Section ${section.sectionIndex} must have a non-empty label of at most 200 characters.`;
		}
		if (sectionByIndex.has(section.sectionIndex)) {
			return `Duplicate section index: ${section.sectionIndex}.`;
		}
		if (!Array.isArray(section.metricList) || section.metricList.length > 100) {
			return `Section ${section.sectionIndex} must contain at most 100 metric definitions.`;
		}

		const metricKeySet = new Set<string>();
		for (const metric of section.metricList) {
			if (!metric.key.trim() || metric.key.length > 120 || !metric.label.trim() || metric.label.length > 200) {
				return `Section ${section.sectionIndex} contains an invalid metric definition.`;
			}
			if (metricKeySet.has(metric.key)) {
				return `Section ${section.sectionIndex} has duplicate metric key ${metric.key}.`;
			}
			if (metric.pointsPossible !== undefined
				&& (!Number.isFinite(metric.pointsPossible) || metric.pointsPossible <= 0)) {
				return `Metric ${metric.key} must have a positive possible-points value.`;
			}
			metricKeySet.add(metric.key);
		}

		sectionByIndex.set(section.sectionIndex, section);
	}

	for (const section of structure.sectionList) {
		const parentSectionIndex = getParentSectionIndex(section.sectionIndex);
		if (parentSectionIndex && !sectionByIndex.has(parentSectionIndex)) {
			return `Section ${section.sectionIndex} is missing parent ${parentSectionIndex}.`;
		}
	}

	return undefined;
}
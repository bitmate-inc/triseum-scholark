import { getParentSectionIndex, validateGameProgressStructure } from './game.progress.structure';

describe('GameProgressStructure', () => {
	it('accepts a dotted hierarchy with unique metrics', () => {
		expect(validateGameProgressStructure({
			schemaVersion: 1,
			sectionList: [
				{ sectionIndex: '0', label: 'Act 1', metricList: [{ key: 'points', label: 'Points', pointsPossible: 100 }] },
				{ sectionIndex: '0.0', label: 'Scene 1', metricList: [] },
				{ sectionIndex: '1', label: 'Act 2', metricList: [] },
			],
		})).toBeUndefined();
		expect(getParentSectionIndex('0.0')).toBe('0');
		expect(getParentSectionIndex('1')).toBeUndefined();
	});

	it('rejects invalid indices, missing parents, duplicate indices and invalid maxima', () => {
		const baseStructure = { schemaVersion: 1, sectionList: [] };
		expect(validateGameProgressStructure({
			...baseStructure,
			sectionList: [{ sectionIndex: '01', label: 'Invalid', metricList: [] }],
		})).toContain('Invalid section index');
		expect(validateGameProgressStructure({
			...baseStructure,
			sectionList: [{ sectionIndex: '0.0', label: 'Orphan', metricList: [] }],
		})).toContain('missing parent');
		expect(validateGameProgressStructure({
			...baseStructure,
			sectionList: [
				{ sectionIndex: '0', label: 'First', metricList: [] },
				{ sectionIndex: '0', label: 'Duplicate', metricList: [] },
			],
		})).toContain('Duplicate section index');
		expect(validateGameProgressStructure({
			...baseStructure,
			sectionList: [{ sectionIndex: '0', label: 'Act', metricList: [{ key: 'points', label: 'Points', pointsPossible: 0 }] }],
		})).toContain('positive possible-points');
	});
});
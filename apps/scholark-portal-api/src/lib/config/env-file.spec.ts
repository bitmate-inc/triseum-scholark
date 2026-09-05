import {
	describe,
	expect,
	it
} from '@jest/globals';

import { getEnvFilePath } from './env-file';

describe(getEnvFilePath.name, () => {
	it('loads the stage environment before local fallbacks', () => {
		expect(getEnvFilePath('stage')).toEqual([
			'.env.stage.local',
			'.env.stage',
			'.env.local',
			'.env',
		]);
	});

	it('loads local fallbacks when no environment is selected', () => {
		expect(getEnvFilePath('')).toEqual(['.env.local', '.env']);
	});
});
import {
	describe,
	expect,
	it,
} from '@jest/globals';

import { parseCorsOrigin } from './server';

describe(parseCorsOrigin.name, () => {
	it('allows any origin when the value is blank', () => {
		expect(parseCorsOrigin('')).toBe(true);
	});

	it('allows any origin when the value is undefined', () => {
		expect(parseCorsOrigin()).toBe(true);
	});

	it('returns a trimmed list of configured origins', () => {
		expect(parseCorsOrigin('http://localhost:3000, http://localhost:3002')).toEqual([
			'http://localhost:3000',
			'http://localhost:3002',
		]);
	});
});
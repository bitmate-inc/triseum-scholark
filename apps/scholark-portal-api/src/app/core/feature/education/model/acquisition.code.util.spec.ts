import {
	digestAcquisitionCode,
	getAcquisitionCodeSuffix,
	normalizeAcquisitionCode
} from './acquisition.code.util';

describe('acquisition code utilities', () => {
	it('normalizes case and separators before digesting', () => {
		expect(normalizeAcquisitionCode(' abcd-1234 ')).toBe('ABCD1234');
		expect(digestAcquisitionCode('abcd-1234')).toBe(digestAcquisitionCode('ABCD1234'));
	});

	it('retains only the final four normalized characters for display', () => {
		expect(getAcquisitionCodeSuffix('ABCDEF-123456-7890AB')).toBe('90AB');
	});
});
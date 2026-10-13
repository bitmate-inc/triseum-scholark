import { listingWindowsOverlap } from './listing.window.util';

describe(listingWindowsOverlap.name, () => {
	const date = (value: string) => new Date(`2026-01-${value}T00:00:00.000Z`);

	it('treats adjacent windows as non-overlapping', () => {
		expect(listingWindowsOverlap(date('01'), date('10'), date('10'), date('20'))).toBe(false);
	});

	it('detects intersecting windows', () => {
		expect(listingWindowsOverlap(date('01'), date('11'), date('10'), date('20'))).toBe(true);
	});

	it('treats an absent end date as unbounded', () => {
		expect(listingWindowsOverlap(date('01'), undefined, date('20'), date('30'))).toBe(true);
		expect(listingWindowsOverlap(date('01'), date('10'), date('20'), undefined)).toBe(false);
	});
});
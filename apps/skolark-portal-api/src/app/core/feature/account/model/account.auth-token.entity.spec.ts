import { AccountAuthToken } from './account.auth-token.entity';

describe(AccountAuthToken.name, () => {
	it('is active only before expiration and consumption', () => {
		const now = new Date('2026-09-01T12:00:00Z');
		const token = new AccountAuthToken();
		token.expiresAt = new Date('2026-09-01T13:00:00Z');

		expect(token.isActive(now)).toBe(true);

		token.consumedAt = now;
		expect(token.isActive(now)).toBe(false);
	});

	it('rejects an expired token', () => {
		const token = new AccountAuthToken();
		token.expiresAt = new Date('2026-09-01T11:00:00Z');

		expect(token.isActive(new Date('2026-09-01T12:00:00Z'))).toBe(false);
	});
});
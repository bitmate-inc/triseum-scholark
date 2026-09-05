import { User } from '../../user/model/user.entity';
import { AccountAuthToken, AccountAuthTokenType } from './account.auth-token.entity';

describe(AccountAuthToken.name, () => {
	it('creates URL-safe random token values', () => {
		const firstValue = AccountAuthToken.createTokenValue();
		const secondValue = AccountAuthToken.createTokenValue();

		expect(firstValue).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(secondValue).not.toBe(firstValue);
	});

	it('creates a token from persistence-ready data', () => {
		const user = new User();
		const expiresAt = new Date('2026-09-02T12:00:00Z');

		const token = AccountAuthToken.create({
			expiresAt,
			type: AccountAuthTokenType.PASSWORD_RESET,
			user,
			valueHash: 'hashed-token',
		});

		expect(token).toMatchObject({
			expiresAt,
			type: AccountAuthTokenType.PASSWORD_RESET,
			user,
			valueHash: 'hashed-token',
		});
	});

	it('is active only before expiration and consumption', () => {
		const now = new Date('2026-09-01T12:00:00Z');
		const token = new AccountAuthToken();
		token.expiresAt = new Date('2026-09-01T13:00:00Z');

		expect(token.isActive(now)).toBe(true);
		expect(token.isConsumed()).toBe(false);
		expect(token.isExpired(now)).toBe(false);

		token.consume(now);
		expect(token.isActive(now)).toBe(false);
		expect(token.isConsumed()).toBe(true);
		expect(token.consumedAt).toBe(now);
	});

	it('rejects an expired token', () => {
		const token = new AccountAuthToken();
		token.expiresAt = new Date('2026-09-01T11:00:00Z');

		const now = new Date('2026-09-01T12:00:00Z');

		expect(token.isActive(now)).toBe(false);
		expect(token.isExpired(now)).toBe(true);
	});
});
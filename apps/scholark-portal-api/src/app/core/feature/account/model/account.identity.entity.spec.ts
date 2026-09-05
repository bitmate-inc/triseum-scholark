import { User } from '../../user/model/user.entity';
import { AccountIdentity, AccountIdentityProvider } from './account.identity.entity';

describe(AccountIdentity.name, () => {
	it('creates a normalized local identity with user ownership', () => {
		const user = Object.assign(new User(), { id: 'user-id' });
		const identity = AccountIdentity.createLocalIdentity({
			email: ' User@Scholark.com ',
			passwordHash: 'password-hash',
			providerData: { source: 'registration' },
			user,
		});

		expect(identity).toMatchObject({
			passwordHash: 'password-hash',
			provider: AccountIdentityProvider.LOCAL,
			providerAccountId: 'user@scholark.com',
			providerData: { source: 'registration' },
			user,
		});
	});

	it('owns password and last-login mutations', () => {
		const lastLoginAt = new Date('2026-09-01T12:00:00Z');
		const identity = new AccountIdentity();

		identity.setPasswordHash('new-password-hash');
		identity.touchLastLogin(lastLoginAt);

		expect(identity.passwordHash).toBe('new-password-hash');
		expect(identity.lastLoginAt).toBe(lastLoginAt);
	});
});
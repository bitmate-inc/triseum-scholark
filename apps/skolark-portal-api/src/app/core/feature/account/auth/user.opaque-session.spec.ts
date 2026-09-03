import type { SessionBuilder as SessionBuilderContract } from '../../../infrastructure/auth/contract/auth.session.contract';
import { AuthSessionData } from '../../../infrastructure/auth/model/auth.session.model';
import { User } from '../../user/model/user.entity';
import { AccountSessionService } from '../service/account.session.service';
import { UserOpaqueSessionResolver } from './user.opaque-session.resolver';
import { UserOpaqueSessionSerializer } from './user.opaque-session.serializer';
import { UserSessionBuilder } from './user.session.builder';

describe('opaque user session adapters', () => {
	it('builds and serializes a user session through the configured transport', async () => {
		const user = Object.assign(new User(), { id: crypto.randomUUID() });
		const accountSessionService = {
			create: jest.fn().mockResolvedValue('opaque-token'),
		} as unknown as AccountSessionService;
		const builder = new UserSessionBuilder();
		const serializer = new UserOpaqueSessionSerializer(accountSessionService);

		const session = builder.build(user);

		await expect(serializer.serialize(session)).resolves.toBe('opaque-token');
		expect(accountSessionService.create).toHaveBeenCalledWith(user);
	});

	it('resolves an opaque token and rebuilds its auth session', async () => {
		const user = Object.assign(new User(), { id: crypto.randomUUID() });
		const accountSessionService = {
			findUser: jest.fn().mockResolvedValue(user),
		} as unknown as AccountSessionService;
		const sessionBuilder: SessionBuilderContract<unknown, AuthSessionData> = new UserSessionBuilder();
		const resolver = new UserOpaqueSessionResolver(accountSessionService, sessionBuilder);

		const session = await resolver.resolve('opaque-token');

		expect(session?.user).toBe(user);
		expect(accountSessionService.findUser).toHaveBeenCalledWith('opaque-token');
	});
});

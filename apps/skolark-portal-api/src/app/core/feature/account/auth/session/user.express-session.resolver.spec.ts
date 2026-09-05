import {
	afterEach,
	describe,
	expect,
	it,
	jest,
} from '@jest/globals';
import { MikroORM, RequestContext } from '@mikro-orm/core';

import type { SessionBuilder } from '../../../../infrastructure/auth/contract/auth.session.contract';
import { AuthSessionData } from '../../../../infrastructure/auth/model/auth.session.model';
import { UserEntityRepository } from '../../../user/repository/user.entity.repository';
import { UserExpressSessionResolver } from './user.express-session.resolver';

describe(UserExpressSessionResolver.name, () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('rebuilds a minimal auth session for an active user', async () => {
		const userRepository = {
			findActiveId: jest.fn<(id: string) => Promise<string | undefined>>()
				.mockResolvedValue('active-user'),
		};
		const sessionBuilder: SessionBuilder = {
			build: jest.fn(() => AuthSessionData.create({ user: { id: 'active-user' } })),
		};
		jest.spyOn(RequestContext, 'create').mockImplementation((_entityManager, callback) => callback());
		const resolver = new UserExpressSessionResolver(
			{ em: {} } as MikroORM,
			userRepository as unknown as UserEntityRepository,
			sessionBuilder,
		);

		await expect(resolver.resolve('active-user')).resolves.toEqual(
			AuthSessionData.create({ user: { id: 'active-user' } }),
		);
		expect(sessionBuilder.build).toHaveBeenCalledWith({ id: 'active-user' });
	});

	it('rejects a session when the user is missing or inactive', async () => {
		const userRepository = {
			findActiveId: jest.fn<(id: string) => Promise<string | undefined>>()
				.mockResolvedValue(undefined),
		};
		const sessionBuilder: SessionBuilder = {
			build: jest.fn<() => AuthSessionData>(),
		};
		jest.spyOn(RequestContext, 'create').mockImplementation((_entityManager, callback) => callback());
		const resolver = new UserExpressSessionResolver(
			{ em: {} } as MikroORM,
			userRepository as unknown as UserEntityRepository,
			sessionBuilder,
		);

		await expect(resolver.resolve('inactive-user')).resolves.toBeUndefined();
		expect(sessionBuilder.build).not.toHaveBeenCalled();
	});
});
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';

import { AdminUserRepository } from '../../core/feature/admin/repository/admin.user.repository';
import { REQUEST_AUTH_PROPERTY } from '../../core/infrastructure/auth/auth.constant';
import { AuthSessionData } from '../../core/infrastructure/auth/model/auth.session.model';
import { AdminAuthGuard } from './admin.auth.guard';

describe('AdminAuthGuard', () => {
	const userId = '9dd05dbf-ec5b-4fdd-93ab-d0c3906832c4';
	const adminUserRepository = {
		existsByUserId: jest.fn<Promise<boolean>, [string]>(),
	};
	const guard = new AdminAuthGuard(adminUserRepository as unknown as AdminUserRepository);

	beforeEach(() => {
		jest.clearAllMocks();
	});

	function createContext(session?: AuthSessionData): ExecutionContext {
		const request = {
			...(session ? { [REQUEST_AUTH_PROPERTY]: session } : {}),
		} as unknown as Request;

		return {
			switchToHttp: () => ({ getRequest: () => request }),
		} as ExecutionContext;
	}

	it('allows users with an AdminUser record', async () => {
		adminUserRepository.existsByUserId.mockResolvedValue(true);

		await expect(guard.canActivate(createContext(AuthSessionData.create({ user: { id: userId } })))).resolves.toBe(true);
		expect(adminUserRepository.existsByUserId).toHaveBeenCalledWith(userId);
	});

	it('rejects authenticated users without an AdminUser record', async () => {
		adminUserRepository.existsByUserId.mockResolvedValue(false);

		await expect(guard.canActivate(createContext(AuthSessionData.create({ user: { id: userId } })))).rejects.toBeInstanceOf(ForbiddenException);
	});

	it('rejects requests without an authenticated user id', async () => {
		await expect(guard.canActivate(createContext())).rejects.toBeInstanceOf(ForbiddenException);
		expect(adminUserRepository.existsByUserId).not.toHaveBeenCalled();
	});
});
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

import { InstructorUserRepository } from '../../core/feature/education/repository/instructor.user.repository';
import { REQUEST_AUTH_PROPERTY } from '../../core/infrastructure/auth/auth.constant';
import { InstructorAuthGuard } from './instructor.auth.guard';

describe('InstructorAuthGuard', () => {
	const existsByUserId = jest.fn();
	const repository = { existsByUserId } as unknown as InstructorUserRepository;
	const guard = new InstructorAuthGuard(repository);

	beforeEach(() => {
		existsByUserId.mockReset();
	});

	it('allows a session linked to an instructor profile', async () => {
		existsByUserId.mockResolvedValue(true);

		await expect(guard.canActivate(createContext('user-1'))).resolves.toBe(true);
		expect(existsByUserId).toHaveBeenCalledWith('user-1');
	});

	it('rejects a session without an instructor profile', async () => {
		existsByUserId.mockResolvedValue(false);

		await expect(guard.canActivate(createContext('user-1'))).rejects.toThrow(ForbiddenException);
	});

	it('rejects a request without a session user', async () => {
		await expect(guard.canActivate(createContext())).rejects.toThrow(ForbiddenException);
		expect(existsByUserId).not.toHaveBeenCalled();
	});
});

function createContext(userId?: string): ExecutionContext {
	const request = userId
		? { [REQUEST_AUTH_PROPERTY]: { user: { id: userId } } }
		: {};

	return {
		switchToHttp: () => ({ getRequest: () => request }),
	} as unknown as ExecutionContext;
}
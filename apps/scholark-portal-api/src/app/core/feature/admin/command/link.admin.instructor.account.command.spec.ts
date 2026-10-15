import { EntityManager } from '@mikro-orm/postgresql';
import { ConflictException, UnprocessableEntityException } from '@nestjs/common';

import { InstructorUser } from '../../education/model/instructor.user.entity';
import { User, UserStatus } from '../../user/model/user.entity';
import { LinkAdminInstructorAccountCommand } from './link.admin.instructor.account.command';

describe('LinkAdminInstructorAccountCommand', () => {
	const findOne = jest.fn();
	const create = jest.fn();
	const persist = jest.fn();
	const flush = jest.fn();
	const transactionEntityManager = { create, findOne, flush, persist };
	const transactional = jest.fn(async (callback: (entityManager: unknown) => unknown) => callback(transactionEntityManager));
	const entityManager = { transactional } as unknown as EntityManager;
	const command = new LinkAdminInstructorAccountCommand(entityManager);

	beforeEach(() => {
		findOne.mockReset();
		create.mockReset();
		persist.mockReset();
		flush.mockReset();
		transactional.mockClear();
	});

	it('links a confirmed account and normalizes its email', async () => {
		const instructor = { id: 'instructor-1' };
		const user = { id: 'user-1', isActive: () => true };
		const instructorUser = { instructor, user };
		findOne
			.mockResolvedValueOnce(instructor)
			.mockResolvedValueOnce(user)
			.mockResolvedValueOnce(null)
			.mockResolvedValueOnce(null);
		create.mockReturnValue(instructorUser);
		flush.mockResolvedValue(undefined);

		await expect(command.execute('instructor-1', '  TEACHER@example.com ')).resolves.toBe(instructorUser);

		expect(findOne).toHaveBeenNthCalledWith(2, User, { email: 'teacher@example.com' });
		expect(create).toHaveBeenCalledWith(InstructorUser, { instructor, user });
		expect(persist).toHaveBeenCalledWith(instructorUser);
		expect(flush).toHaveBeenCalled();
	});

	it('rejects an unconfirmed account', async () => {
		findOne
			.mockResolvedValueOnce({ id: 'instructor-1' })
			.mockResolvedValueOnce({ id: 'user-1', isActive: () => false, status: UserStatus.PENDING });

		await expect(command.execute('instructor-1', 'teacher@example.com')).rejects.toThrow(UnprocessableEntityException);
		expect(create).not.toHaveBeenCalled();
	});

	it('rejects an account linked to another instructor', async () => {
		findOne
			.mockResolvedValueOnce({ id: 'instructor-2' })
			.mockResolvedValueOnce({ id: 'user-1', isActive: () => true })
			.mockResolvedValueOnce({ instructor: { id: 'instructor-1' } });

		await expect(command.execute('instructor-2', 'teacher@example.com')).rejects.toThrow(ConflictException);
	});
});
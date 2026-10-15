import { EntityManager } from '@mikro-orm/postgresql';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { AccountIdentity, AccountIdentityProvider } from '../../account/model/account.identity.entity';
import { User, UserStatus } from '../../user/model/user.entity';
import { InstructorInvitation } from '../model/instructor.invitation.entity';
import { InstructorUser } from '../model/instructor.user.entity';
import { AcceptInstructorInvitationCommand } from './accept.instructor.invitation.command';

describe(AcceptInstructorInvitationCommand.name, () => {
	const create = jest.fn();
	const findOne = jest.fn();
	const flush = jest.fn();
	const persist = jest.fn();
	const transactionEntityManager = { create, findOne, flush, persist };
	const transactional = jest.fn(async (callback: (entityManager: unknown) => unknown) => callback(transactionEntityManager));
	const entityManager = { transactional } as unknown as EntityManager;
	const encode = jest.fn();
	const passwordEncoder = { encode };
	const command = new AcceptInstructorInvitationCommand(entityManager, passwordEncoder as never);

	beforeEach(() => {
		create.mockReset();
		findOne.mockReset();
		flush.mockReset();
		persist.mockReset();
		transactional.mockReset();
		transactional.mockImplementation(async (callback) => callback(transactionEntityManager));
		encode.mockReset();
		encode.mockResolvedValue('hashed-password');
	});

	it('creates an active account and links it when accepting a new-user invitation', async () => {
		const invitation = new InstructorInvitation();
		invitation.email = 'teacher@example.com';
		invitation.expiresAt = new Date(Date.now() + 60_000);
		invitation.instructor = { id: 'instructor-1', name: 'Economics' } as never;
		findOne
			.mockResolvedValueOnce(invitation)
			.mockResolvedValueOnce(null)
			.mockResolvedValueOnce(null);
		create.mockImplementation((_entity, data) => ({ ...data }));
		flush.mockResolvedValue(undefined);

		await expect(command.execute({
			firstName: 'Taylor',
			lastName: 'Teacher',
			password: 'a-secure-password',
			token: 'invitation-token',
		})).resolves.toEqual({
			accountCreated: true,
			email: 'teacher@example.com',
			instructorName: 'Economics',
		});

		expect(encode).toHaveBeenCalledWith('a-secure-password');
		expect(create).toHaveBeenCalledWith(User, expect.objectContaining({
			email: 'teacher@example.com',
			firstName: 'Taylor',
			lastName: 'Teacher',
			status: UserStatus.ACTIVE,
		}));
		expect(create).toHaveBeenCalledWith(InstructorUser, expect.objectContaining({ instructor: invitation.instructor }));
		expect(persist.mock.calls.some(([entity]) => entity instanceof AccountIdentity && entity.provider === AccountIdentityProvider.LOCAL)).toBe(true);
		expect(invitation.isAccepted()).toBe(true);
	});

	it('links an existing account without replacing its credentials', async () => {
		const invitation = new InstructorInvitation();
		invitation.email = 'teacher@example.com';
		invitation.expiresAt = new Date(Date.now() + 60_000);
		invitation.instructor = { id: 'instructor-1', name: 'Economics' } as never;
		const user = { id: 'user-1', email: invitation.email, isActive: () => true };
		findOne
			.mockResolvedValueOnce(invitation)
			.mockResolvedValueOnce(user)
			.mockResolvedValueOnce(null)
			.mockResolvedValueOnce(null);
		create.mockReturnValue({ instructor: invitation.instructor, user });
		flush.mockResolvedValue(undefined);

		await expect(command.execute({ token: 'invitation-token' })).resolves.toMatchObject({
			accountCreated: false,
			email: invitation.email,
		});

		expect(encode).not.toHaveBeenCalled();
		expect(findOne).toHaveBeenNthCalledWith(3, InstructorUser, { user: 'user-1' }, { populate: ['instructor'] });
		expect(invitation.isAccepted()).toBe(true);
	});

	it('rejects invalid or expired invitations', async () => {
		findOne.mockResolvedValueOnce(null);

		await expect(command.execute({ token: 'invalid-token' })).rejects.toThrow(NotFoundException);
		expect(findOne).toHaveBeenCalledTimes(1);
	});

	it('rejects linking an account already assigned to another instructor', async () => {
		const invitation = new InstructorInvitation();
		invitation.email = 'teacher@example.com';
		invitation.expiresAt = new Date(Date.now() + 60_000);
		invitation.instructor = { id: 'instructor-2', name: 'Biology' } as never;
		const user = { id: 'user-1', email: invitation.email, isActive: () => true };
		findOne
			.mockResolvedValueOnce(invitation)
			.mockResolvedValueOnce(user)
			.mockResolvedValueOnce({ instructor: { id: 'instructor-1' } });

		await expect(command.execute({ token: 'invitation-token' })).rejects.toThrow(ConflictException);
		expect(invitation.isAccepted()).toBe(false);
	});
});
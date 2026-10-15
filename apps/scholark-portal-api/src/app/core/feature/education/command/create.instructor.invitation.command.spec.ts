import { LockMode } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { ConflictException } from '@nestjs/common';

import { User } from '../../user/model/user.entity';
import { Instructor } from '../model/instructor.entity';
import { InstructorInvitation } from '../model/instructor.invitation.entity';
import { CreateInstructorInvitationCommand } from './create.instructor.invitation.command';

describe(CreateInstructorInvitationCommand.name, () => {
	const find = jest.fn();
	const findOne = jest.fn();
	const flush = jest.fn();
	const persist = jest.fn();
	const transactionEntityManager = { find, findOne, flush, persist };
	const transactional = jest.fn(async (callback: (entityManager: unknown) => unknown) => callback(transactionEntityManager));
	const entityManager = { transactional } as unknown as EntityManager;
	const sendMail = jest.fn();
	const mailer = { sendMail };
	const mailerConfiguration = { jsonTransport: true };
	const command = new CreateInstructorInvitationCommand(
		entityManager,
		{ tokenTtlSeconds: 3600 } as never,
		{
			confirmEmailFrom: 'noreply@scholark.com',
			confirmEmailUrl: 'http://localhost:3000/auth/confirm-email',
		} as never,
		mailerConfiguration as never,
		mailer as never,
	);

	beforeEach(() => {
		find.mockReset();
		findOne.mockReset();
		flush.mockReset();
		persist.mockReset();
		mailerConfiguration.jsonTransport = true;
		transactional.mockReset();
		transactional.mockImplementation(async (callback) => callback(transactionEntityManager));
		sendMail.mockReset();
		sendMail.mockResolvedValue(undefined);
	});

	it('stores only a token hash and emails the normalized recipient', async () => {
		const instructor = { id: 'instructor-1', name: 'Economics' };
		const inviter = { id: 'admin-1' };
		findOne
			.mockResolvedValueOnce(instructor)
			.mockResolvedValueOnce(null)
			.mockResolvedValueOnce(inviter)
			.mockResolvedValueOnce(null);
		find.mockResolvedValueOnce([]);
		flush.mockResolvedValue(undefined);

		const result = await command.execute({
			email: ' TEACHER@EXAMPLE.COM ',
			instructorId: 'instructor-1',
			invitedByUserId: 'admin-1',
		});

		expect(result).toMatchObject({ email: 'teacher@example.com', instructorName: 'Economics' });
		expect(result.invitationUrl).toBeDefined();
		expect(result).not.toHaveProperty('token');
		expect(findOne).toHaveBeenNthCalledWith(
			1,
			Instructor,
			{ id: 'instructor-1' },
			{ lockMode: LockMode.PESSIMISTIC_WRITE },
		);
		expect(findOne).toHaveBeenNthCalledWith(4, User, { email: 'teacher@example.com' });
		expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'teacher@example.com' }));

		const invitation = persist.mock.calls.find(([entity]) => entity instanceof InstructorInvitation)?.[0] as InstructorInvitation;
		const message = sendMail.mock.calls[0][0] as { text: string };
		const invitationUrl = message.text.match(/https?:\/\/\S+/)?.[0];
		const tokenValue = new URL(invitationUrl!).searchParams.get('token')!;
		expect(new URL(invitationUrl!).pathname).toBe('/auth/instructor-invitation');
		expect(invitation.tokenHash).toBe(InstructorInvitation.hashTokenValue(tokenValue));
		expect(invitation.tokenHash).not.toBe(tokenValue);
		expect(invitation.expiresAt.getTime()).toBeGreaterThan(Date.now());
	});

	it('does not return the invitation URL for SMTP mail delivery', async () => {
		mailerConfiguration.jsonTransport = false;
		findOne
			.mockResolvedValueOnce({ id: 'instructor-1', name: 'Economics' })
			.mockResolvedValueOnce(null)
			.mockResolvedValueOnce({ id: 'admin-1' })
			.mockResolvedValueOnce(null);
		find.mockResolvedValueOnce([]);
		flush.mockResolvedValue(undefined);

		const result = await command.execute({
			email: 'teacher@example.com',
			instructorId: 'instructor-1',
			invitedByUserId: 'admin-1',
		});

		expect(result).not.toHaveProperty('invitationUrl');
	});

	it('does not issue an invitation for an instructor already linked to an account', async () => {
		findOne
			.mockResolvedValueOnce({ id: 'instructor-1' })
			.mockResolvedValueOnce({ id: 'link-1' });

		await expect(command.execute({
			email: 'teacher@example.com',
			instructorId: 'instructor-1',
			invitedByUserId: 'admin-1',
		})).rejects.toThrow(ConflictException);
		expect(sendMail).not.toHaveBeenCalled();
	});
});
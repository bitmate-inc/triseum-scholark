import { EntityManager } from '@mikro-orm/postgresql';

import { User } from '../../user/model/user.entity';
import { InstructorInvitation } from '../model/instructor.invitation.entity';
import { GetInstructorInvitationQuery } from './get.instructor.invitation.query';

describe(GetInstructorInvitationQuery.name, () => {
	const findOne = jest.fn();
	const entityManager = { findOne } as unknown as EntityManager;
	const query = new GetInstructorInvitationQuery(entityManager);

	beforeEach(() => {
		findOne.mockReset();
	});

	it('looks up a hashed active token and returns invitation details', async () => {
		const invitation = {
			email: 'teacher@example.com',
			expiresAt: new Date('2026-10-16T12:00:00Z'),
			instructor: { name: 'Instructor' },
		};
		findOne
			.mockResolvedValueOnce(invitation)
			.mockResolvedValueOnce({ id: 'user-1' });

		await expect(query.execute('invite-token')).resolves.toEqual({
			accountExists: true,
			email: invitation.email,
			expiresAt: invitation.expiresAt,
			instructorName: invitation.instructor.name,
		});
		expect(findOne).toHaveBeenNthCalledWith(
			1,
			InstructorInvitation,
			expect.objectContaining({
				acceptedAt: null,
				revokedAt: null,
				tokenHash: InstructorInvitation.hashTokenValue('invite-token'),
			}),
			expect.objectContaining({ populate: ['instructor'] }),
		);
		expect(findOne).toHaveBeenNthCalledWith(2, User, { email: invitation.email });
	});

	it('returns no details for an expired, consumed, revoked, or unknown token', async () => {
		findOne.mockResolvedValueOnce(null);

		await expect(query.execute('invalid-token')).resolves.toBeUndefined();
		expect(findOne).toHaveBeenCalledTimes(1);
	});
});
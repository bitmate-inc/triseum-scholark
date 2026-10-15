import { User } from '../../user/model/user.entity';
import { Instructor } from './instructor.entity';
import { InstructorInvitation } from './instructor.invitation.entity';

describe(InstructorInvitation.name, () => {
	it('creates URL-safe token values and stores a one-way hash', () => {
		const value = InstructorInvitation.createTokenValue();

		expect(value).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(InstructorInvitation.hashTokenValue(value)).not.toBe(value);
		expect(InstructorInvitation.hashTokenValue(value)).toBe(InstructorInvitation.hashTokenValue(value));
	});

	it('normalizes the email and retains invitation relationships', () => {
		const instructor = new Instructor();
		const invitedBy = new User();
		const expiresAt = new Date('2026-10-16T12:00:00Z');

		const invitation = InstructorInvitation.create({
			email: '  TEACHER@example.com ',
			expiresAt,
			instructor,
			invitedBy,
			tokenHash: 'hashed-token',
		});

		expect(invitation).toMatchObject({
			email: 'teacher@example.com',
			expiresAt,
			instructor,
			invitedBy,
			tokenHash: 'hashed-token',
		});
	});

	it('is active only until it expires, is accepted, or is revoked', () => {
		const now = new Date('2026-10-15T12:00:00Z');
		const invitation = new InstructorInvitation();
		invitation.expiresAt = new Date('2026-10-16T12:00:00Z');

		expect(invitation.isActive(now)).toBe(true);

		invitation.accept(now);
		expect(invitation.isActive(now)).toBe(false);
		expect(invitation.isAccepted()).toBe(true);

		invitation.acceptedAt = undefined;
		invitation.revoke(now);
		expect(invitation.isActive(now)).toBe(false);
		expect(invitation.isRevoked()).toBe(true);

		invitation.revokedAt = undefined;
		invitation.expiresAt = new Date('2026-10-15T11:00:00Z');
		expect(invitation.isExpired(now)).toBe(true);
		expect(invitation.isActive(now)).toBe(false);
	});
});
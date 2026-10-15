import { createHash, randomBytes } from 'node:crypto';

import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { User } from '../../user/model/user.entity';
import { Instructor } from './instructor.entity';

@Entity({ tableName: 'instructor_invitation' })
export class InstructorInvitation {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => Instructor, { deleteRule: 'cascade' })
	instructor!: Instructor;

	@ManyToOne(() => User, { deleteRule: 'restrict' })
	invitedBy!: User;

	@Property()
	email!: string;

	@Property({ hidden: true, unique: true })
	tokenHash!: string;

	@Property()
	expiresAt!: Date;

	@Property({ nullable: true })
	acceptedAt?: Date;

	@Property({ nullable: true })
	revokedAt?: Date;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	isExpired(now: Date = new Date()): boolean {
		return this.expiresAt <= now;
	}

	isAccepted(): boolean {
		return !!this.acceptedAt;
	}

	isRevoked(): boolean {
		return !!this.revokedAt;
	}

	isActive(now: Date = new Date()): boolean {
		return !this.isAccepted() && !this.isRevoked() && !this.isExpired(now);
	}

	accept(acceptedAt: Date = new Date()): void {
		this.acceptedAt = acceptedAt;
	}

	revoke(revokedAt: Date = new Date()): void {
		this.revokedAt = revokedAt;
	}

	static createTokenValue(): string {
		return randomBytes(32).toString('base64url');
	}

	static hashTokenValue(value: string): string {
		return createHash('sha256').update(value).digest('base64url');
	}

	static create(data: {
		email: string;
		expiresAt: Date;
		instructor: Instructor;
		invitedBy: User;
		tokenHash: string;
	}): InstructorInvitation {
		const invitation = new InstructorInvitation();
		invitation.email = data.email.trim().toLowerCase();
		invitation.expiresAt = data.expiresAt;
		invitation.instructor = data.instructor;
		invitation.invitedBy = data.invitedBy;
		invitation.tokenHash = data.tokenHash;

		return invitation;
	}

}
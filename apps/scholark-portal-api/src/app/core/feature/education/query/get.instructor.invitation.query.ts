import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { User } from '../../user/model/user.entity';
import { InstructorInvitation } from '../model/instructor.invitation.entity';

export interface GetInstructorInvitationResult {
	accountExists: boolean;
	email: string;
	expiresAt: Date;
	instructorName: string;
}

@Injectable()
export class GetInstructorInvitationQuery {

	constructor(private readonly entityManager: EntityManager) {}

	async execute(tokenValue: string): Promise<GetInstructorInvitationResult | undefined> {
		const invitation = await this.entityManager.findOne(
			InstructorInvitation,
			{
				acceptedAt: null,
				expiresAt: { $gt: new Date() },
				revokedAt: null,
				tokenHash: InstructorInvitation.hashTokenValue(tokenValue),
			},
			{ populate: ['instructor'] },
		);
		if (!invitation) {
			return undefined;
		}

		const user = await this.entityManager.findOne(User, { email: invitation.email });

		return {
			accountExists: !!user,
			email: invitation.email,
			expiresAt: invitation.expiresAt,
			instructorName: invitation.instructor.name,
		};
	}

}
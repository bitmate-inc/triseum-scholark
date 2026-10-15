import { LockMode } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { BCryptPasswordEncoder } from '../../../../../lib/security/encoder/bcrypt.password-encoder';
import { AccountIdentity } from '../../account/model/account.identity.entity';
import { User, UserStatus } from '../../user/model/user.entity';
import { InstructorInvitation } from '../model/instructor.invitation.entity';
import { InstructorUser } from '../model/instructor.user.entity';

export interface AcceptInstructorInvitationResult {
	accountCreated: boolean;
	email: string;
	instructorName: string;
}

@Injectable()
export class AcceptInstructorInvitationCommand {

	constructor(
		private readonly entityManager: EntityManager,
		private readonly passwordEncoder: BCryptPasswordEncoder,
	) {}

	async execute(data: {
		firstName?: string;
		lastName?: string;
		password?: string;
		token: string;
	}): Promise<AcceptInstructorInvitationResult> {
		const tokenHash = InstructorInvitation.hashTokenValue(data.token);
		const now = new Date();

		return await this.entityManager.transactional(async (transactionalEntityManager) => {
			const invitation = await transactionalEntityManager.findOne(
				InstructorInvitation,
				{ tokenHash },
				{ lockMode: LockMode.PESSIMISTIC_WRITE, populate: ['instructor'] },
			);
			if (!invitation || !invitation.isActive(now)) {
				throw new NotFoundException('This instructor invitation is invalid or expired.');
			}

			let user = await transactionalEntityManager.findOne(User, { email: invitation.email });
			const accountCreated = !user;
			if (!user) {
				if (!data.password) {
					throw new BadRequestException('A password is required to create an account.');
				}

				const passwordHash = await this.passwordEncoder.encode(data.password);
				user = transactionalEntityManager.create(User, {
					email: invitation.email,
					firstName: data.firstName?.trim() || undefined,
					lastName: data.lastName?.trim() || undefined,
					status: UserStatus.ACTIVE,
				});
				const accountIdentity = AccountIdentity.createLocalIdentity({
					email: invitation.email,
					passwordHash,
					user,
				});
				transactionalEntityManager.persist(user);
				transactionalEntityManager.persist(accountIdentity);
			} else if (!user.isActive()) {
				user.status = UserStatus.ACTIVE;
				transactionalEntityManager.persist(user);
			}

			const userLink = accountCreated
				? undefined
				: await transactionalEntityManager.findOne(
					InstructorUser,
					{ user: user.id! },
					{ populate: ['instructor'] },
				);
			if (userLink && userLink.instructor.id !== invitation.instructor.id) {
				throw new ConflictException('This account is already linked to another instructor.');
			}

			const instructorLink = await transactionalEntityManager.findOne(
				InstructorUser,
				{ instructor: invitation.instructor.id! },
				{ populate: ['user'] },
			);
			if (instructorLink && instructorLink.user.id !== user.id) {
				throw new ConflictException('This instructor is already linked to another account.');
			}
			if (!userLink && !instructorLink) {
				const instructorUser = transactionalEntityManager.create(InstructorUser, {
					instructor: invitation.instructor,
					user,
				});
				transactionalEntityManager.persist(instructorUser);
			}

			invitation.accept(now);
			transactionalEntityManager.persist(invitation);
			await transactionalEntityManager.flush();

			return {
				accountCreated,
				email: invitation.email,
				instructorName: invitation.instructor.name,
			};
		});
	}

}
import { EntityManager } from '@mikro-orm/postgresql';
import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnprocessableEntityException,
} from '@nestjs/common';

import { Instructor } from '../../education/model/instructor.entity';
import { InstructorUser } from '../../education/model/instructor.user.entity';
import { User } from '../../user/model/user.entity';

@Injectable()
export class LinkAdminInstructorAccountCommand {

	constructor(private readonly entityManager: EntityManager) {}

	async execute(instructorId: string, email: string): Promise<InstructorUser> {
		const normalizedEmail = email.trim().toLowerCase();

		return this.entityManager.transactional(async (transactionalEntityManager) => {
			const instructor = await transactionalEntityManager.findOne(Instructor, { id: instructorId });
			if (!instructor) {
				throw new NotFoundException('Instructor not found.');
			}

			const user = await transactionalEntityManager.findOne(User, { email: normalizedEmail });
			if (!user) {
				throw new NotFoundException('An account with this email was not found.');
			}
			if (!user.isActive()) {
				throw new UnprocessableEntityException('The account email must be confirmed before instructor access is linked.');
			}

			const existingUserLink = await transactionalEntityManager.findOne(
				InstructorUser,
				{ user: user.id! },
				{ populate: ['instructor'] },
			);
			if (existingUserLink) {
				if (existingUserLink.instructor.id === instructor.id) {
					return existingUserLink;
				}
				throw new ConflictException('This account is already linked to another instructor.');
			}

			const existingInstructorLink = await transactionalEntityManager.findOne(
				InstructorUser,
				{ instructor: instructor.id! },
				{ populate: ['user'] },
			);
			if (existingInstructorLink) {
				throw new ConflictException('This instructor is already linked to another account.');
			}

			const instructorUser = transactionalEntityManager.create(InstructorUser, { instructor, user });
			transactionalEntityManager.persist(instructorUser);
			await transactionalEntityManager.flush();

			return instructorUser;
		});
	}

}
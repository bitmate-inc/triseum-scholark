import { EntityManager } from '@mikro-orm/postgresql';
import {
	Injectable,
	NotFoundException,
	UnprocessableEntityException,
} from '@nestjs/common';

import { Publisher } from '../../publisher/model/publisher.entity';
import { PublisherMember } from '../../publisher/model/publisher.member.entity';
import { User } from '../../user/model/user.entity';

@Injectable()
export class LinkAdminPublisherMemberCommand {

	constructor(private readonly entityManager: EntityManager) {}

	async execute(publisherId: string, email: string): Promise<PublisherMember> {
		const normalizedEmail = email.trim().toLowerCase();

		return this.entityManager.transactional(async (transactionalEntityManager) => {
			const publisher = await transactionalEntityManager.findOne(Publisher, { id: publisherId });
			if (!publisher) {
				throw new NotFoundException('Publisher not found.');
			}

			const user = await transactionalEntityManager.findOne(User, { email: normalizedEmail });
			if (!user) {
				throw new NotFoundException('An account with this email was not found.');
			}
			if (!user.isActive()) {
				throw new UnprocessableEntityException('The account email must be confirmed before publisher access is linked.');
			}

			const existingMember = await transactionalEntityManager.findOne(
				PublisherMember,
				{ publisher: publisher.id!, user: user.id! },
			);
			if (existingMember) {
				return existingMember;
			}

			const publisherMember = transactionalEntityManager.create(PublisherMember, { publisher, user });
			transactionalEntityManager.persist(publisherMember);
			await transactionalEntityManager.flush();

			return publisherMember;
		});
	}

}
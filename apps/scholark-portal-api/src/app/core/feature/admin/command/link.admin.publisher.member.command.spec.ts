import { EntityManager } from '@mikro-orm/postgresql';

import { Publisher } from '../../publisher/model/publisher.entity';
import { PublisherMember } from '../../publisher/model/publisher.member.entity';
import { User } from '../../user/model/user.entity';
import { LinkAdminPublisherMemberCommand } from './link.admin.publisher.member.command';

describe(LinkAdminPublisherMemberCommand.name, () => {
	const transactionalEntityManager = {
		create: jest.fn(),
		findOne: jest.fn(),
		flush: jest.fn(),
		persist: jest.fn(),
	};
	const entityManager = {
		transactional: async (callback: (manager: typeof transactionalEntityManager) => Promise<unknown>) => callback(transactionalEntityManager),
	} as unknown as EntityManager;
	const command = new LinkAdminPublisherMemberCommand(entityManager);
	const publisher = { id: 'publisher-id' } as Publisher;
	const user = { id: 'user-id', isActive: () => true } as User;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('links an existing confirmed account using its normalized email', async () => {
		const publisherMember = { user } as PublisherMember;
		transactionalEntityManager.findOne
			.mockResolvedValueOnce(publisher)
			.mockResolvedValueOnce(user)
			.mockResolvedValueOnce(undefined);
		transactionalEntityManager.create.mockReturnValue(publisherMember);

		await expect(command.execute('publisher-id', ' Publisher@Example.com ')).resolves.toBe(publisherMember);

		expect(transactionalEntityManager.findOne).toHaveBeenNthCalledWith(2, User, { email: 'publisher@example.com' });
		expect(transactionalEntityManager.create).toHaveBeenCalledWith(PublisherMember, { publisher, user });
		expect(transactionalEntityManager.persist).toHaveBeenCalledWith(publisherMember);
		expect(transactionalEntityManager.flush).toHaveBeenCalledTimes(1);
	});

	it('returns an existing membership without creating a duplicate', async () => {
		const publisherMember = { user } as PublisherMember;
		transactionalEntityManager.findOne
			.mockResolvedValueOnce(publisher)
			.mockResolvedValueOnce(user)
			.mockResolvedValueOnce(publisherMember);

		await expect(command.execute('publisher-id', 'publisher@example.com')).resolves.toBe(publisherMember);

		expect(transactionalEntityManager.create).not.toHaveBeenCalled();
		expect(transactionalEntityManager.persist).not.toHaveBeenCalled();
	});
});
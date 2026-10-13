import { ConflictException } from '@nestjs/common';

import { UpdateAdminPublicGameListingCommand } from './update.admin.public.game.listing.command';

function createCommand() {
	const gameVersion = { id: 'version-id' };
	const listing = {
		endAt: undefined as Date | undefined,
		gameVersion,
		id: 'listing-id',
		isPublished: jest.fn().mockReturnValue(true),
		priceGroupList: { removeAll: jest.fn() },
		startAt: new Date('2026-01-01T00:00:00.000Z'),
	};
	const publicGameListingRepository = {
		findForAdminUpdate: jest.fn().mockResolvedValue(listing),
		findByGameVersion: jest.fn().mockResolvedValue([]),
		save: jest.fn(),
	};
	const gameVersionRepository = { findOneBy: jest.fn().mockResolvedValue(gameVersion) };
	const unitOfWork = { transactional: jest.fn((work: () => Promise<unknown>) => work()) };
	const command = new UpdateAdminPublicGameListingCommand(
		publicGameListingRepository as never,
		gameVersionRepository as never,
		{} as never,
		{} as never,
		unitOfWork as never,
	);

	return { command, publicGameListingRepository, listing };
}

describe(UpdateAdminPublicGameListingCommand.name, () => {
	it('allows a published listing to be closed without changing its terms', async () => {
		const { command, publicGameListingRepository, listing } = createCommand();
		const endAt = new Date('2026-06-01T00:00:00.000Z');

		await command.execute('game-id', 'listing-id', { endAt });

		expect(listing.endAt).toBe(endAt);
		expect(publicGameListingRepository.save).toHaveBeenCalledTimes(1);
	});

	it('rejects changing published listing terms while closing it', async () => {
		const { command, publicGameListingRepository } = createCommand();

		await expect(command.execute('game-id', 'listing-id', {
			available: false,
			endAt: new Date('2026-06-01T00:00:00.000Z'),
		})).rejects.toBeInstanceOf(ConflictException);

		expect(publicGameListingRepository.save).not.toHaveBeenCalled();
	});
});